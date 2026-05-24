import { UserRepository } from '../repositories/user.repository.js';
import { FriendRepository } from '../repositories/friend.repository.js';
import { redis } from '../config/redis.js';

export class LeaderboardService {
  private userRepo = new UserRepository();
  private friendRepo = new FriendRepository();

  /**
   * Fetch rankings based on XP, total distance, or captured territory count.
   * Supports global, weekly, or social friend filtering.
   */
  async getLeaderboard(
    userId: string,
    type: 'XP' | 'DISTANCE' | 'TERRITORIES',
    period: 'GLOBAL' | 'WEEKLY' | 'FRIENDS',
    limit = 20,
    page = 1,
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    const prisma = (await import('../config/database.js')).prisma;

    // Determine target sort columns
    let orderByField: any = {};
    if (type === 'XP') orderByField = { xp: 'desc' };
    else if (type === 'DISTANCE') orderByField = { totalDistance: 'desc' };
    else if (type === 'TERRITORIES') orderByField = { territoryCount: 'desc' };

    // 1. Social friends filter
    if (period === 'FRIENDS') {
      const friendsList = await this.friendRepo.findFriends(userId);
      const friendIds = friendsList.map((f) => f.id);
      const allIds = [userId, ...friendIds];

      const users = await prisma.user.findMany({
        where: { id: { in: allIds } },
        orderBy: orderByField,
        take: limit,
        skip,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          level: true,
          xp: true,
          totalDistance: true,
          territoryCount: true,
        },
      });

      return users.map((user: any, idx: number) => ({
        ...user,
        rank: skip + idx + 1,
      }));
    }

    // 2. Weekly filter (evaluates runs completed in the last 7 days)
    if (period === 'WEEKLY') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (type === 'DISTANCE') {
        const stats = await prisma.run.groupBy({
          by: ['userId'],
          where: {
            startTime: { gte: sevenDaysAgo },
          },
          _sum: {
            distance: true,
          },
          orderBy: {
            _sum: {
              distance: 'desc',
            },
          },
          take: limit,
          skip,
        });

        const users = await prisma.user.findMany({
          where: {
            id: { in: stats.map((s: any) => s.userId) },
          },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
          },
        });

        const usersMap = new Map(users.map((u: any) => [u.id, u]));

        return stats
          .map((stat: any, idx: number) => {
            const user = usersMap.get(stat.userId) as any;
            return {
              id: stat.userId,
              username: user?.username || 'Unknown',
              avatarUrl: user?.avatarUrl || null,
              level: user?.level || 1,
              score: stat._sum.distance || 0,
              rank: skip + idx + 1,
            };
          })
          .filter((item: any) => item.username !== 'Unknown');
      } else {
        // Fallback for weekly XP/TERRITORIES: pull general weekly activity logs
        const stats = await prisma.activity.groupBy({
          by: ['userId'],
          where: {
            createdAt: { gte: sevenDaysAgo },
          },
          _sum: {
            xpGained: true,
          },
          orderBy: {
            _sum: {
              xpGained: 'desc',
            },
          },
          take: limit,
          skip,
        });

        const users = await prisma.user.findMany({
          where: {
            id: { in: stats.map((s: any) => s.userId) },
          },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
          },
        });

        const usersMap = new Map(users.map((u: any) => [u.id, u]));

        return stats
          .map((stat: any, idx: number) => {
            const user = usersMap.get(stat.userId) as any;
            return {
              id: stat.userId,
              username: user?.username || 'Unknown',
              avatarUrl: user?.avatarUrl || null,
              level: user?.level || 1,
              score: stat._sum.xpGained || 0,
              rank: skip + idx + 1,
            };
          })
          .filter((item: any) => item.username !== 'Unknown');
      }
    }

    // 3. Global filter (cached in Redis with DB fallback)
    const cacheKey = `leaderboard:global:${type}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData && page === 1) {
      return JSON.parse(cachedData);
    }

    const globalUsers = await prisma.user.findMany({
      orderBy: orderByField,
      take: limit,
      skip,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        level: true,
        xp: true,
        totalDistance: true,
        territoryCount: true,
      },
    });

    const result = globalUsers.map((user: any, idx: number) => ({
      ...user,
      rank: skip + idx + 1,
    }));

    // Cache the first page for 5 minutes
    if (page === 1) {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    }

    return result;
  }

  /**
   * Push user updates directly to Redis sorted sets for sub-millisecond ranking queries.
   */
  async updateLeaderboardCache(userId: string, username: string, xp: number): Promise<void> {
    await redis.zadd('leaderboard:xp', xp, JSON.stringify({ userId, username }));
  }
}
