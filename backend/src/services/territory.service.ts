import * as h3 from 'h3-js';
import { TerritoryRepository } from '../repositories/territory.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { GamificationService } from './gamification.service.js';
import { redis } from '../config/redis.js';
import { H3_RESOLUTION, ANTI_CHEAT, XP_RATES } from '../config/constants.js';
import { Territory } from '@prisma/client';

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

      // Rule 3: Prevent instant recapture using Redis cooldown lock (30 seconds)
      const cooldownKey = `cooldown:territory:${gridId}`;
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

      // Check current ownership
      const currentTerritory = await this.territoryRepo.findByGridId(gridId);

      if (currentTerritory && currentTerritory.ownerId === userId) {
        // Already owned by this user, update last activity but do not recapture
        await this.territoryRepo.upsertCapture(gridId, userId);
        return {
          captured: false,
          gridId,
          status: 'already_owned',
        };
      }

      let captureStatus: 'claimed' | 'recaptured' = 'claimed';
      const previousOwnerId = currentTerritory?.ownerId;

      // Execute capture updates in Postgres
      const prisma = (await import('../config/database.js')).prisma;
      const territory = await prisma.$transaction(async (tx: any) => {
        // Update or insert the territory claim
        const updatedTerritory = await tx.territory.upsert({
          where: { gridId },
          update: {
            ownerId: userId,
            capturedAt: new Date(),
            lastActivity: new Date(),
            capturePoints: 100,
          },
          create: {
            gridId,
            ownerId: userId,
            capturedAt: new Date(),
            lastActivity: new Date(),
            capturePoints: 100,
          },
        });

        // Increment new owner's territoryCount
        await tx.user.update({
          where: { id: userId },
          data: { territoryCount: { increment: 1 } },
        });

        // Decrement previous owner's territoryCount if applicable
        if (previousOwnerId) {
          captureStatus = 'recaptured';
          await tx.user.update({
            where: { id: previousOwnerId },
            data: { territoryCount: { decrement: 1 } },
          });
        }

        return updatedTerritory;
      });

      // Set PostGIS center_geog on the territory (fail-safe)
      try {
        const { PostgisService } = await import('./postgis.service.js');
        const postgis = new PostgisService();
        await postgis.setTerritoryGeog(territory.id, latitude, longitude);
      } catch {
        // PostGIS not available — territory still works via H3 gridId
      }

      // Set Redis Cooldown Lock (30s)
      await redis.set(cooldownKey, 'locked', 'EX', ANTI_CHEAT.TERRITORY_CAPTURE_COOLDOWN);

      // Award Capture XP (100 XP) using gamification service
      const xpGained = XP_RATES.TERRITORY_CAPTURE;
      await this.gamificationService.awardXP(userId, xpGained, 'CAPTURE', 0);

      // Trigger user badges eligibility check
      await this.gamificationService.checkBadgeEligibility(userId);
      if (previousOwnerId) {
        await this.gamificationService.checkBadgeEligibility(previousOwnerId);
      }

      return {
        captured: true,
        gridId,
        status: captureStatus,
        xpGained,
        territory,
      };
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
