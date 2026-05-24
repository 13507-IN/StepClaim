import { UserRepository } from '../repositories/user.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { BadgeRepository } from '../repositories/badge.repository.js';
import { LEVEL_THRESHOLDS, STREAK } from '../config/constants.js';
import { ActivityType } from '@prisma/client';

export class GamificationService {
  private userRepo = new UserRepository();
  private activityRepo = new ActivityRepository();
  private badgeRepo = new BadgeRepository();

  /**
   * Award experience points to a user, checking for level-up triggers.
   */
  async awardXP(
    userId: string,
    xpGained: number,
    activityType: ActivityType,
    distance?: number,
  ): Promise<{ user: any; leveledUp: boolean; previousLevel: number; newLevel: number }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const previousLevel = user.level;
    const newXP = user.xp + xpGained;

    // Check level progression
    let newLevel = user.level;
    for (const threshold of LEVEL_THRESHOLDS) {
      if (newXP >= threshold.xpRequired) {
        newLevel = threshold.level;
      }
    }

    const leveledUp = newLevel > previousLevel;

    // Update user stats in DB
    const updatedUser = await this.userRepo.updateStats(userId, {
      xp: newXP,
      level: newLevel,
    });

    // Log the action to activities table
    await this.activityRepo.create(userId, activityType, xpGained, distance);

    if (leveledUp) {
      // Log the level up activity
      await this.activityRepo.create(userId, 'LEVEL_UP', 0);
      // Re-trigger badge eligibility check for explorer or other level rewards
      await this.checkBadgeEligibility(userId);
    }

    return {
      user: updatedUser,
      leveledUp,
      previousLevel,
      newLevel,
    };
  }

  /**
   * Evaluate if a user is eligible for achievement badges and unlock them.
   */
  async checkBadgeEligibility(userId: string): Promise<any[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) return [];

    const unlockedBadges: any[] = [];
    const allBadges = await this.badgeRepo.findAll();

    // Helper to award a badge if they qualify and don't already have it
    const tryAwardBadge = async (badgeName: string) => {
      const alreadyUnlocked = await this.badgeRepo.hasBadge(userId, badgeName);
      if (!alreadyUnlocked) {
        const badge = allBadges.find((b) => b.name === badgeName);
        if (badge) {
          const awarded = await this.badgeRepo.awardBadge(userId, badge.id);
          await this.activityRepo.create(userId, 'BADGE_UNLOCKED', 0);
          unlockedBadges.push(awarded);
          console.log(`🎖️ User ${userId} unlocked badge: ${badgeName}`);
        }
      }
    };

    // 1. First Capture
    if (user.territoryCount >= 1) {
      await tryAwardBadge('First Capture');
    }

    // 2. Explorer (captured >= 10 cells or Level >= 10)
    if (user.territoryCount >= 10 || user.level >= 10) {
      await tryAwardBadge('Explorer');
    }

    // 3. Territory King (captured >= 50 cells or Level >= 50)
    if (user.territoryCount >= 50 || user.level >= 50) {
      await tryAwardBadge('Territory King');
    }

    // 4. 100km Club (totalDistance >= 100,000m)
    if (user.totalDistance >= 100000) {
      await tryAwardBadge('100km Club');
    }

    // 5. 7 Day Streak
    if (user.streak >= 7) {
      await tryAwardBadge('7 Day Streak');
    }

    // Check run-specific conditions
    const prisma = (await import('../config/database.js')).prisma;
    const maxSingleRun = await prisma.run.findFirst({
      where: { userId },
      orderBy: { distance: 'desc' },
    });

    if (maxSingleRun) {
      // 6. Marathoner (single run >= 42.195 km)
      if (maxSingleRun.distance >= 42195) {
        await tryAwardBadge('Marathoner');
      }

      // 7. Speed Runner (averageSpeed >= 5.5 m/s in run [~20 km/h])
      if (maxSingleRun.averageSpeed >= 5.5) {
        await tryAwardBadge('Speed Runner');
      }
    }

    return unlockedBadges;
  }

  /**
   * Assess and update user daily streaks based on daily movement thresholds (1km).
   * Typically evaluated when completing a run.
   */
  async checkDailyStreak(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (!user) return false;

    const prisma = (await import('../config/database.js')).prisma;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const streakExpiryLimit = new Date(todayStart.getTime() - 36 * 60 * 60 * 1000); // 36 hours without a run

    // Check if user completed >= 1km today
    const runsToday = await prisma.run.findMany({
      where: {
        userId,
        startTime: { gte: todayStart },
      },
    });

    const distanceToday = runsToday.reduce((sum: number, run: any) => sum + run.distance, 0);

    if (distanceToday >= STREAK.MIN_DAILY_DISTANCE) {
      // Already completed today's streak requirements
      // Check if streak was already increased today
      const streakIncrementedToday = await prisma.activity.findFirst({
        where: {
          userId,
          activityType: 'STREAK_MILESTONE',
          createdAt: { gte: todayStart },
        },
      });

      if (!streakIncrementedToday) {
        // Did user complete streak yesterday? If not, reset and build up from 1
        const runsYesterday = await prisma.run.findMany({
          where: {
            userId,
            startTime: { gte: yesterdayStart, lt: todayStart },
          },
        });
        const distanceYesterday = runsYesterday.reduce((sum: number, run: any) => sum + run.distance, 0);

        let nextStreak = user.streak;
        if (distanceYesterday >= STREAK.MIN_DAILY_DISTANCE) {
          nextStreak += 1;
        } else {
          nextStreak = 1;
        }

        await this.userRepo.updateStats(userId, { streak: nextStreak });
        await this.activityRepo.create(userId, 'STREAK_MILESTONE', 0);
        await this.checkBadgeEligibility(userId);
        return true;
      }
    }

    return false;
  }
}
