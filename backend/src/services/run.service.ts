import { RunRepository } from '../repositories/run.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { GamificationService } from './gamification.service.js';
import { XP_RATES } from '../config/constants.js';
import { Run } from '@prisma/client';

export class RunService {
  private runRepo = new RunRepository();
  private userRepo = new UserRepository();
  private gamificationService = new GamificationService();

  /**
   * Start a tracking run.
   */
  async startRun(userId: string): Promise<Run> {
    const activeRuns = await (await import('../config/database.js')).prisma.run.findFirst({
      where: { userId, endTime: null },
    });

    if (activeRuns) {
      // If there is an active run, return it instead of creating a new one
      return activeRuns;
    }

    return this.runRepo.create(userId, new Date());
  }

  /**
   * Complete/End a tracking run, computing final metrics and awarding XP.
   */
  async endRun(
    runId: string,
    userId: string,
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING',
  ): Promise<{ run: Run; xpGained: number; leveledUp: boolean; previousLevel: number; newLevel: number; streakMilestone: boolean }> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error('Run not found');
    if (run.userId !== userId) throw new Error('Unauthorized');
    if (run.endTime) throw new Error('Run already ended');

    const endTime = new Date();
    const duration = Math.max(Math.round((endTime.getTime() - run.startTime.getTime()) / 1000), 1); // seconds

    // Re-read the run right before final calculation so late trackpoints are included.
    const finalRun = await this.runRepo.findById(runId);
    const locations = finalRun?.locations || [];
    let distanceMeters = 0;
    
    if (locations.length >= 2) {
      const { haversineDistance } = await import('../utils/haversine.js');
      for (let i = 1; i < locations.length; i++) {
        distanceMeters += haversineDistance(
          locations[i - 1].latitude,
          locations[i - 1].longitude,
          locations[i].latitude,
          locations[i].longitude,
        );
      }
    } else {
      distanceMeters = (finalRun?.distance ?? run.distance) * 1000;
    }

    const distanceKm = Number((distanceMeters / 1000).toFixed(3)); // Convert meters to km
    const averageSpeed = duration > 0 ? distanceMeters / duration : 0.0; // m/s

    // Calculate XP: 100m = rate XP (from constants)
    const rate = XP_RATES[activityType];
    const xpGained = Math.round((distanceMeters / 100) * rate);

    // Save completed run in DB with distance in KM
    const completedRun = await this.runRepo.complete(runId, {
      endTime,
      distance: distanceKm,
      duration,
      averageSpeed,
      xpGained,
    });

    // Update user cumulative statistics in KM
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const updatedTotalDistance = user.totalDistance + distanceKm;
    await this.userRepo.updateStats(userId, {
      totalDistance: updatedTotalDistance,
    });

    // Award XP to user and log activity
    const awardResult = await this.gamificationService.awardXP(userId, xpGained, 'RUN_COMPLETED', distanceKm);

    // Trigger daily streak check (requires 1km daily movement)
    const streakMilestone = await this.gamificationService.checkDailyStreak(userId);

    // Check general badge awards (100km, Marathoner, Speed Runner, etc.)
    await this.gamificationService.checkBadgeEligibility(userId);

    return {
      run: completedRun,
      xpGained,
      leveledUp: awardResult.leveledUp,
      previousLevel: awardResult.previousLevel,
      newLevel: awardResult.newLevel,
      streakMilestone,
    };
  }

  /**
   * Log a coordinates coordinate update during an active run.
   */
  async logTrackpoint(
    userId: string,
    runId: string | null,
    latitude: number,
    longitude: number,
    speed: number,
  ): Promise<any> {
    const timestamp = new Date();
    
    // Save coordinate to DB
    const trackpoint = await this.runRepo.addLocation(userId, runId, latitude, longitude, speed, timestamp);

    // If there is an active run, update the run distance incrementally
    if (runId) {
      const run = await this.runRepo.findById(runId);
      if (run && !run.endTime && run.locations.length >= 2) {
        const locations = run.locations;
        const lastLoc = locations[locations.length - 2];
        const { haversineDistance } = await import('../utils/haversine.js');
        const incrementMeters = haversineDistance(
          lastLoc.latitude,
          lastLoc.longitude,
          latitude,
          longitude,
        );
        const incrementKm = incrementMeters / 1000;

        const newDistanceKm = Number((run.distance + incrementKm).toFixed(3));
        const duration = Math.max(Math.round((timestamp.getTime() - run.startTime.getTime()) / 1000), 1);
        const averageSpeed = duration > 0 ? (newDistanceKm * 1000) / duration : 0; // m/s

        await (await import('../config/database.js')).prisma.run.update({
          where: { id: runId },
          data: {
            distance: newDistanceKm,
            duration,
            averageSpeed,
          },
        });
      }
    }

    return trackpoint;
  }
}
