import { prisma } from '../config/database';
import { Activity, ActivityType } from '@prisma/client';

/**
 * Repository handling user game activity logs database operations.
 */
export class ActivityRepository {
  /**
   * Create an activity feed item.
   */
  async create(
    userId: string,
    activityType: ActivityType,
    xpGained: number,
    distance?: number,
  ): Promise<Activity> {
    return prisma.activity.create({
      data: {
        userId,
        activityType,
        xpGained,
        distance: distance || 0.0,
      },
    });
  }

  /**
   * Find a user's activities.
   */
  async findByUserId(userId: string, limit = 15, skip = 0): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });
  }

  /**
   * Fetch activity feed for a user and their friends.
   */
  async getFriendsFeed(userId: string, limit = 20, skip = 0): Promise<any[]> {
    // Get list of accepted friends IDs
    const userFriends = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      select: {
        requesterId: true,
        receiverId: true,
      },
    });

    const friendIds = userFriends.map((f) =>
      f.requesterId === userId ? f.receiverId : f.requesterId,
    );

    // Include self in feed
    const allIds = [userId, ...friendIds];

    return prisma.activity.findMany({
      where: {
        userId: {
          in: allIds,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
      take: limit,
      skip,
    });
  }
}
