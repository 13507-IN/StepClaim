import { prisma } from '../config/database';
import { CheatLog } from '@prisma/client';

/**
 * Repository handling user cheating / anomaly logs database operations.
 */
export class CheatLogRepository {
  /**
   * Log an anti-cheat violation.
   */
  async create(
    userId: string,
    reason: string,
    speed?: number,
    distance?: number,
  ): Promise<CheatLog> {
    return prisma.cheatLog.create({
      data: {
        userId,
        reason,
        speed,
        distance,
      },
    });
  }

  /**
   * Retrieve all cheat logs recorded against a user.
   */
  async findByUserId(userId: string): Promise<CheatLog[]> {
    return prisma.cheatLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Count total logs for a user to see if ban threshold is crossed.
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.cheatLog.count({
      where: { userId },
    });
  }
}
