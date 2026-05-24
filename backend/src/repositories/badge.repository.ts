import { prisma } from '../config/database';
import { Badge, UserBadge } from '@prisma/client';

/**
 * Repository handling profile badges and achievement awards.
 */
export class BadgeRepository {
  /**
   * Get all registered badges in the system.
   */
  async findAll(): Promise<Badge[]> {
    return prisma.badge.findMany();
  }

  /**
   * Find a specific badge by its name.
   */
  async findByName(name: string): Promise<Badge | null> {
    return prisma.badge.findUnique({
      where: { name },
    });
  }

  /**
   * Get all badges earned/unlocked by a user.
   */
  async findByUserId(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /**
   * Check if a user has already unlocked a badge by name.
   */
  async hasBadge(userId: string, badgeName: string): Promise<boolean> {
    const count = await prisma.userBadge.count({
      where: {
        userId,
        badge: {
          name: badgeName,
        },
      },
    });
    return count > 0;
  }

  /**
   * Award a badge to a user.
   */
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    return prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: {
        badge: true,
      },
    });
  }
}
