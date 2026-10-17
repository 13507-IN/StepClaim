import * as h3 from 'h3-js';
import { TerritoryRepository } from '../repositories/territory.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { GamificationService } from './gamification.service.js';
import { redis } from '../config/redis.js';
import { H3_RESOLUTION, ANTI_CHEAT, XP_RATES } from '../config/constants.js';
import { Territory } from '@prisma/client';
import { randomUUID } from 'node:crypto';

// Extremely defensive, runtime-safe H3 library version compatibility wrappers
const latLngToCell = h3.latLngToCell || (h3 as any).geoToH3;
const gridDisk = h3.gridDisk || (h3 as any).kRing;
const cellToBoundary = h3.cellToBoundary || (h3 as any).h3ToGeoBoundary;

export class TerritoryService {
  private territoryRepo = new TerritoryRepository();
  private userRepo = new UserRepository();
  private gamificationService = new GamificationService();

  /**
   * Translate GPS coordinates to H3 resolution 9 cell index ID.
   */
  getGridIdFromLatLng(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION);
  }

  /**
   * Get the polygon boundary coordinates for drawing a hexagon.
   */
  getHexagonBoundary(gridId: string): [number, number][] {
    try {
      const boundary = cellToBoundary(gridId);
      // H3 returns array of [lat, lng] or [lng, lat] depending on version,
      // standard H3 returns [lat, lng]. Ensure formatted as [lat, lng].
      return boundary;
    } catch (e) {
      console.error(`Failed to get boundary for H3 grid: ${gridId}`, e);
      return [];
    }
  }

  /**
   * Attempt to capture a territory grid based on GPS coordinates.
   */
  async captureTerritory(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<{
    captured: boolean;
    gridId: string;
    status: 'claimed' | 'recaptured' | 'cooldown' | 'already_owned' | 'error';
    cooldownRemaining?: number;
    xpGained?: number;
    territory?: Territory;
  }> {
    try {
      const gridId = this.getGridIdFromLatLng(latitude, longitude);

      // A cooldown prevents repeated capture; a short distributed lock serializes
      // concurrent requests while ownership and counters are updated in Postgres.
      const cooldownKey = `cooldown:territory:${gridId}`;
      try {
        const cooldownExists = await redis.get(cooldownKey);
        if (cooldownExists) {
          const ttl = await redis.ttl(cooldownKey);
          return {
            captured: false,
            gridId,
            status: 'cooldown',
            cooldownRemaining: ttl > 0 ? ttl : ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN,
          };
        }
      } catch (error) {
        // Postgres advisory locking and lastActivity remain authoritative if Redis is down.
        console.warn('Redis cooldown lookup failed; checking the database:', error);
      }

      const lockKey = `capture-lock:territory:${gridId}`;
      const lockToken = randomUUID();
      let distributedLockAcquired = false;
      try {
        const lockAcquired = await redis.set(
          lockKey,
          lockToken,
          'EX',
          15,
          'NX',
        );
        if (lockAcquired !== 'OK') {
          const ttl = await redis.ttl(lockKey);
          return {
            captured: false,
            gridId,
            status: 'cooldown',
            cooldownRemaining: ttl > 0 ? ttl : 1,
          };
        }
        distributedLockAcquired = true;
      } catch (error) {
        // The Postgres advisory lock below is the correctness boundary.
        console.warn('Redis capture lock unavailable; using Postgres lock:', error);
      }

      try {
        // Recheck after acquiring the lock so an earlier request cannot have
        // completed between the initial cooldown check and lock acquisition.
        if (distributedLockAcquired) {
          const cooldownAfterLock = await redis.get(cooldownKey).catch(() => null);
          if (cooldownAfterLock) {
            const ttl = await redis.ttl(cooldownKey);
            return {
              captured: false,
              gridId,
              status: 'cooldown',
              cooldownRemaining: ttl > 0 ? ttl : ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN,
            };
          }
        }

        const prisma = (await import('../config/database.js')).prisma;
        const capture = await prisma.$transaction(async (tx) => {
          // Lock this grid in Postgres too, so correctness does not rely solely
          // on Redis availability and concurrent captures see the latest owner.
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(7242, hashtext(${gridId}))`;
          const currentTerritory = await tx.territory.findUnique({
            where: { gridId },
            select: { ownerId: true, lastActivity: true },
          });
          const previousOwnerId = currentTerritory?.ownerId ?? null;

          if (previousOwnerId === userId) {
            return { territory: null, previousOwnerId, status: 'already_owned' as const };
          }

          const now = new Date();
          if (
            currentTerritory &&
            now.getTime() - currentTerritory.lastActivity.getTime() <
              ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN * 1000
          ) {
            const cooldownRemaining = Math.ceil(
              ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN -
                (now.getTime() - currentTerritory.lastActivity.getTime()) / 1000,
            );
            return {
              territory: null,
              previousOwnerId,
              status: 'cooldown' as const,
              cooldownRemaining,
            };
          }

          const territory = await tx.territory.upsert({
            where: { gridId },
            update: {
              ownerId: userId,
              capturedAt: now,
              lastActivity: now,
              capturePoints: 100,
            },
            create: {
              gridId,
              ownerId: userId,
              capturedAt: now,
              lastActivity: now,
              capturePoints: 100,
            },
          });

          await tx.user.update({
            where: { id: userId },
            data: { territoryCount: { increment: 1 } },
          });

          if (previousOwnerId) {
            await tx.user.update({
              where: { id: previousOwnerId },
              data: { territoryCount: { decrement: 1 } },
            });
          }

          return {
            territory,
            previousOwnerId,
            status: previousOwnerId ? 'recaptured' as const : 'claimed' as const,
            cooldownRemaining: undefined,
          };
        });

        if (capture.status === 'cooldown') {
          return {
            captured: false,
            gridId,
            status: 'cooldown',
            cooldownRemaining: capture.cooldownRemaining,
          };
        }

        if (capture.status === 'already_owned' || !capture.territory) {
          return {
            captured: false,
            gridId,
            status: 'already_owned',
          };
        }

        // Set PostGIS center_geog on the territory (fail-safe)
        try {
          const { PostgisService } = await import('./postgis.service.js');
          const postgis = new PostgisService();
          await postgis.setTerritoryGeog(capture.territory.id, latitude, longitude);
        } catch {
          // PostGIS not available — territory still works via H3 gridId
        }

        // Publish the cooldown before releasing the capture lock.
        await redis
          .set(cooldownKey, 'locked', 'EX', ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN)
          .catch((error) => {
            console.warn('Failed to cache territory cooldown:', error);
          });

        // Award Capture XP (100 XP) using gamification service
        const xpGained = XP_RATES.TERRITORY_CAPTURE;
        await this.gamificationService.awardXP(userId, xpGained, 'CAPTURE', 0);

        // Trigger user badges eligibility check
        await this.gamificationService.checkBadgeEligibility(userId);
        if (capture.previousOwnerId) {
          await this.gamificationService.checkBadgeEligibility(capture.previousOwnerId);
        }

        return {
          captured: true,
          gridId,
          status: capture.status,
          xpGained,
          territory: capture.territory,
        };
      } finally {
        // Only the request that owns this lock may release it.
        if (distributedLockAcquired) {
          await redis.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
            1,
            lockKey,
            lockToken,
          ).catch((error) => {
            console.warn('Failed to release territory capture lock:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error in captureTerritory service:', error);
      return {
        captured: false,
        gridId: '',
        status: 'error',
      };
    }
  }

  /**
   * Retrieve nearby territories within a ~2km radius around coordinates.
   * Primary: PostGIS ST_DWithin spatial index query.
   * Fallback: H3 gridDisk ring computation (if PostGIS is unavailable or no center_geog data).
   */
  async getNearbyTerritories(
    latitude: number,
    longitude: number,
  ): Promise<{ gridId: string; boundary: [number, number][]; owner: any; captured: boolean }[]> {
    try {
      // Try PostGIS spatial query first (much faster with GIST index)
      try {
        const { PostgisService } = await import('./postgis.service.js');
        const postgis = new PostgisService();
        const spatialResults = await postgis.findTerritoriesWithinRadius(latitude, longitude, 2000);

        if (spatialResults.length > 0) {
          // Build grid results from PostGIS spatial data
          const centerCell = this.getGridIdFromLatLng(latitude, longitude);
          const surroundingGrids: string[] = gridDisk(centerCell, 8);

          // Merge PostGIS captured territories with surrounding hex grid
          const capturedMap = new Map<string, typeof spatialResults[0]>();
          spatialResults.forEach((t) => capturedMap.set(t.grid_id, t));

          const gridsResult = surroundingGrids.map((gId) => {
            const capturedInfo = capturedMap.get(gId);
            const boundary = this.getHexagonBoundary(gId);

            return {
              gridId: gId,
              boundary,
              captured: !!capturedInfo,
              owner: capturedInfo
                ? {
                    id: capturedInfo.owner_id,
                    username: capturedInfo.owner_username || 'Unknown',
                    avatarUrl: capturedInfo.owner_avatar_url || null,
                  }
                : null,
            };
          });

          return gridsResult;
        }
      } catch {
        // PostGIS not available, fall through to H3 fallback
      }

      // Fallback: H3 gridDisk approach (original implementation)
      const centerCell = this.getGridIdFromLatLng(latitude, longitude);

      // Generate spatial hexagon disks covering roughly a 2km radius around the center (k=8 ring size)
      const surroundingGrids: string[] = gridDisk(centerCell, 8);

      // Pull captured claims from DB
      const capturedTerritories = await this.territoryRepo.findNearby(surroundingGrids);
      const capturedMap = new Map<string, typeof capturedTerritories[0]>();
      capturedTerritories.forEach((t) => capturedMap.set(t.gridId, t));

      // Build overall array representing captured and uncaptured nodes
      const gridsResult = surroundingGrids.map((gridId) => {
        const capturedInfo = capturedMap.get(gridId);
        const boundary = this.getHexagonBoundary(gridId);

        return {
          gridId,
          boundary,
          captured: !!capturedInfo,
          owner: capturedInfo
            ? {
                id: capturedInfo.ownerId,
                username: capturedInfo.owner?.username || 'Unknown',
                avatarUrl: capturedInfo.owner?.avatarUrl || null,
              }
            : null,
        };
      });

      return gridsResult;
    } catch (error) {
      console.error('Error getting nearby territories:', error);
      return [];
    }
  }
}
