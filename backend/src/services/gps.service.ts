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
  ): Promise<{
    processed: boolean;
    reason?: string;
    speed?: number;
    distanceGained?: number;
    captureResult?: any;
  }> {
    // 1. Fetch user's last recorded position (prioritize Redis cache for high speed, fallback to DB)
    const redisKey = `active_location:${userId}`;
    let lastPoint: { latitude: number; longitude: number; timestamp: Date } | null = null;

    try {
      const lastPointRaw = await redis.get(redisKey);
      if (lastPointRaw) {
        const parsed = JSON.parse(lastPointRaw);
        lastPoint = {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          timestamp: new Date(parsed.timestamp),
        };
      }
    } catch (redisErr) {
      // Fail-safe: fallback to checking latest UserLocation in DB
    }

    if (!lastPoint) {
      try {
        const prisma = (await import('../config/database.js')).prisma;
        const latestLoc = await prisma.userLocation.findFirst({
          where: { userId },
          orderBy: { timestamp: 'desc' },
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

    const currentPoint = {
      latitude,
      longitude,
      timestamp: new Date(),
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
    const validatedSpeed = check.speed || speed;
    await this.runService.logTrackpoint(userId, runId, latitude, longitude, validatedSpeed);

    // 4. Cache latest location in Redis for future speed checks (fail-safe)
    try {
      await redis.set(
        redisKey,
        JSON.stringify({
          latitude,
          longitude,
          timestamp: currentPoint.timestamp.toISOString(),
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
    const captureResult = await this.territoryService.captureTerritory(userId, latitude, longitude);

    return {
      processed: true,
      speed: validatedSpeed,
      distanceGained: check.distance,
      captureResult,
    };
  }
}
