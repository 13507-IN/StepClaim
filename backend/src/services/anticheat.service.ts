import { CheatLogRepository } from '../repositories/cheatLog.repository';
import { haversineDistance } from '../utils/haversine';
import { SPEED_LIMITS, ANTI_CHEAT } from '../config/constants';

export interface LocationInput {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export class AntiCheatService {
  private cheatLogRepo = new CheatLogRepository();

  /**
   * Validate user movement coordinates, detecting GPS spoofing, unrealistic speed,
   * static noise, or teleport jumps.
   */
  async validateMovement(
    userId: string,
    lastPoint: LocationInput | null,
    currentPoint: LocationInput,
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING',
  ): Promise<{ isValid: boolean; reason?: 'jitter' | 'unrealistic_speed' | 'teleport' | string; speed?: number; distance?: number }> {
    if (!lastPoint) {
      // First point is always considered valid
      return { isValid: true };
    }

    const distance = haversineDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      currentPoint.latitude,
      currentPoint.longitude,
    ); // in meters

    const timeDiffMs = currentPoint.timestamp.getTime() - lastPoint.timestamp.getTime();
    const timeDiffSec = timeDiffMs / 1000;

    // Reject duplicate or back-in-time timestamps
    if (timeDiffSec <= 0) {
      return { isValid: false, reason: 'invalid_timestamp_order', distance, speed: 0 };
    }

    // Ignore tiny static noise movements (< 5 meters) - return isValid=false with reason='jitter'
    // This allows the GPS service to ignore it without flagging it as a cheat.
    if (distance < ANTI_CHEAT.MIN_MOVEMENT_THRESHOLD) {
      return { isValid: false, reason: 'jitter', distance, speed: 0 };
    }

    const speed = distance / timeDiffSec; // meters per second

    // Teleport Check: > 500m in less than 10 seconds
    if (distance >= ANTI_CHEAT.TELEPORT_DISTANCE && timeDiffSec < ANTI_CHEAT.TELEPORT_TIME_THRESHOLD) {
      await this.logCheatAttempt(userId, `Teleported ${distance.toFixed(1)}m in ${timeDiffSec.toFixed(1)}s`, speed, distance);
      return { isValid: false, reason: 'teleport', speed, distance };
    }

    // Speed check based on activity type limits
    const speedLimit = SPEED_LIMITS[activityType];
    if (speed > speedLimit) {
      await this.logCheatAttempt(
        userId,
        `Speed limit exceeded for ${activityType}: ${speed.toFixed(1)} m/s (Limit: ${speedLimit} m/s)`,
        speed,
        distance,
      );
      return { isValid: false, reason: 'unrealistic_speed', speed, distance };
    }

    return { isValid: true, speed, distance };
  }

  /**
   * Save a suspicious activity to the cheat logs database.
   */
  async logCheatAttempt(userId: string, reason: string, speed?: number, distance?: number): Promise<void> {
    console.warn(`🚨 Anti-Cheat triggered for User ${userId}. Reason: ${reason}`);
    await this.cheatLogRepo.create(userId, reason, speed, distance);
  }
}
