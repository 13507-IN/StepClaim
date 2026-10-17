import { RunRepository } from '../repositories/run.repository.js';
import { GamificationService } from './gamification.service.js';
import { XP_RATES } from '../config/constants.js';
import { Run } from '@prisma/client';
import { haversineDistance } from '../utils/haversine.js';
import { prisma } from '../config/database.js';

export class RunService {
  private runRepo = new RunRepository();
  private gamificationService = new GamificationService();

  /**
   * Start a tracking run.
   */
  async startRun(userId: string): Promise<Run> {
    return prisma.$transaction(async (tx) => {
      // Ensure concurrent start requests cannot create multiple active runs.
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(7241, hashtext(${userId}))
      `;
      const activeRun = await tx.run.findFirst({
        where: { userId, endTime: null },
      });

      if (activeRun) return activeRun;

      return tx.run.create({
        data: {
          userId,
          startTime: new Date(),
          distance: 0,
          duration: 0,
          averageSpeed: 0,
          xpGained: 0,
        },
      });
    });
  }

  /**
   * Complete/End a tracking run, computing final metrics and awarding XP.
   */
  async endRun(
    runId: string,
    userId: string,
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING',
  ): Promise<{ run: Run; xpGained: number; leveledUp: boolean; previousLevel: number; newLevel: number; streakMilestone: boolean }> {
    // The row lock serializes completion with trackpoint inserts. A GPS update
    // that acquired the lock first is included; one arriving later sees endTime.
    const finalization = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT "id" FROM "runs" WHERE "id" = ${runId} FOR UPDATE
      `;

      const run = await tx.run.findUnique({
        where: { id: runId },
        include: { locations: { orderBy: { timestamp: 'asc' } } },
      });
      if (!run) throw new Error('Run not found');
      if (run.userId !== userId) throw new Error('Unauthorized');
      if (run.endTime) throw new Error('Run already ended');

      const endTime = new Date();
      const duration = Math.max(
        Math.round((endTime.getTime() - run.startTime.getTime()) / 1000),
        1,
      );
      let distanceMeters = 0;

      // Calculate from the locked, final set of points. Haversine works even
      // when PostGIS is unavailable and uses the same server-validated route.
      if (run.locations.length >= 2) {
        for (let i = 1; i < run.locations.length; i++) {
          distanceMeters += haversineDistance(
            run.locations[i - 1].latitude,
            run.locations[i - 1].longitude,
            run.locations[i].latitude,
            run.locations[i].longitude,
          );
        }
      } else {
        distanceMeters = run.distance * 1000;
      }

      const distanceKm = Number((distanceMeters / 1000).toFixed(3));
      const averageSpeed = duration > 0 ? distanceMeters / duration : 0;
      const xpGained = Math.round((distanceMeters / 100) * XP_RATES[activityType]);
      const completedRun = await tx.run.update({
        where: { id: runId },
        data: { endTime, distance: distanceKm, duration, averageSpeed, xpGained },
      });

      return { run: completedRun, distanceKm, xpGained };
    });
    const { run: completedRun, distanceKm, xpGained } = finalization;

    // Update user cumulative statistics in KM
    await prisma.user.update({
      where: { id: userId },
      data: { totalDistance: { increment: distanceKm } },
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
    runId: string,
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

        await (await import('../config/database.js')).prisma.run.updateMany({
          where: { id: runId, userId, endTime: null },
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
