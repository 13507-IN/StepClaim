import { AntiCheatService } from './anticheat.service.js';
import { RunService } from './run.service.js';
import { TerritoryService } from './territory.service.js';
import { redis } from '../config/redis.js';
import { RunRepository } from '../repositories/run.repository.js';

export class GpsService {
  private antiCheatService = new AntiCheatService();
  private runService = new RunService();
  private territoryService = new TerritoryService();
  private runRepo = new RunRepository();

  /**
   * Process a live coordinate ping from a user's device.
   * Validates GPS data, checks for spoofing, logs position, indices online map coordinates,
   * and runs H3 capture checks.
   */
  async processLocationUpdate(
    userId: string,
    runId: string | null,
    latitude: number,
    longitude: number,
    speed: number,
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING',
    accuracy: number,
  ): Promise<{
    processed: boolean;
    reason?: string;
    speed?: number;
    distanceGained?: number;
    captureResult?: any;
  }> {
    // Never accept trackpoints (or territory captures) outside the caller's active run.
    // This prevents a valid user from attaching GPS data to another user's run.
    if (!runId || !(await this.runRepo.isActiveRunOwnedByUser(runId, userId))) {
      return { processed: false, reason: 'active_run_required' };
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      !Number.isFinite(speed) ||
      speed < 0 ||
      !Number.isFinite(accuracy) ||
      accuracy < 0
    ) {
      return { processed: false, reason: 'invalid_coordinates' };
    }
    if (accuracy > 35) {
      return { processed: false, reason: 'poor_accuracy' };
    }

    // Keep anti-cheat history scoped to this run, not the user's previous activity.
    const redisKey = `active_location:${userId}:${runId}`;
    let lastPoint: { latitude: number; longitude: number; timestamp: Date } | null = null;
    let acceptedPointCount = 0;

    try {
      const lastPointRaw = await redis.get(redisKey);
      if (lastPointRaw) {
        const parsed = JSON.parse(lastPointRaw);
        lastPoint = {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          timestamp: new Date(parsed.timestamp),
        };
        acceptedPointCount = Number.isInteger(parsed.acceptedPointCount)
          ? parsed.acceptedPointCount
          : 1;
      }
    } catch (redisErr) {
      // Fail-safe: fallback to checking latest UserLocation in DB
    }

    if (!lastPoint) {
      try {
        const prisma = (await import('../config/database.js')).prisma;
        const latestLoc = await prisma.userLocation.findFirst({
          where: { userId, runId },
          orderBy: { timestamp: 'desc' },
        });
        acceptedPointCount = await prisma.userLocation.count({
          where: { userId, runId },
        });
        if (latestLoc) {
          lastPoint = {
            latitude: latestLoc.latitude,
            longitude: latestLoc.longitude,
            timestamp: latestLoc.timestamp,
          };
        }
      } catch (dbErr) {
        console.error('Failed to fetch last location fallback from DB:', dbErr);
      }
    }

    // Use server receipt time; client timestamps are not authoritative for speed checks.
    const pointTimestamp = new Date();

    const currentPoint = {
      latitude,
      longitude,
      timestamp: pointTimestamp,
    };

    // 2. Validate coordinates through Anti-Cheat Service
    const check = await this.antiCheatService.validateMovement(userId, lastPoint, currentPoint, activityType);

    if (!check.isValid) {
      if (check.reason === 'jitter') {
        // Silently ignore static noise jitter coordinates (don't log infraction)
        return { processed: false, reason: 'jitter' };
      }
      return {
        processed: false,
        reason: check.reason || 'invalid_coordinates',
        speed: check.speed,
        distanceGained: check.distance,
      };
    }

    // 3. Coordinate is valid, save position to DB (ALWAYS SAVES TRACKPOINT)
    const validatedSpeed = check.speed ?? 0;
    await this.runService.logTrackpoint(userId, runId, latitude, longitude, validatedSpeed);
    acceptedPointCount += 1;

    // 4. Cache latest location in Redis for future speed checks (fail-safe)
    try {
      await redis.set(
        redisKey,
        JSON.stringify({
          latitude,
          longitude,
          timestamp: currentPoint.timestamp.toISOString(),
          acceptedPointCount,
        }),
        'EX',
        3600, // expire in 1 hour
      );

      // 5. Index online location in Redis GEO structure for nearby player rendering (expires in 120s)
      await redis.geoadd('active_players_geo', longitude, latitude, userId);
      await redis.set(`active_player_info:${userId}`, JSON.stringify({ latitude, longitude, timestamp: currentPoint.timestamp }), 'EX', 120);
    } catch (redisErr: any) {
      // Redis warning ignored to guarantee core trackpoint logging succeeds
    }

    // 6. Check territory capture coordinates
    // Require multiple accepted fixes before the first claim; a single initial
    // GPS sample proves location, not movement through the cell.
    const captureResult = acceptedPointCount >= 3
      ? await this.territoryService.captureTerritory(userId, latitude, longitude)
      : undefined;

    return {
      processed: true,
      speed: validatedSpeed,
      distanceGained: check.distance,
      captureResult,
    };
  }
}
