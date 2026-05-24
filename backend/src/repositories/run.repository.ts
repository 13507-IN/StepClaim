import { prisma } from '../config/database';
import { Run, UserLocation, Prisma } from '@prisma/client';

/**
 * Repository handling user run/activity tracking database operations.
 */
export class RunRepository {
  /**
   * Create a new tracking run.
   */
  async create(userId: string, startTime: Date): Promise<Run> {
    return prisma.run.create({
      data: {
        userId,
        startTime,
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        xpGained: 0,
      },
    });
  }

  /**
   * Find a run by its ID.
   */
  async findById(id: string): Promise<(Run & { locations: UserLocation[] }) | null> {
    return prisma.run.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  /**
   * Find all runs belonging to a specific user.
   */
  async findByUserId(userId: string, limit = 10, skip = 0): Promise<Run[]> {
    return prisma.run.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip,
    });
  }

  /**
   * Add a geolocation trackpoint connected to a running activity.
   */
  async addLocation(
    userId: string,
    runId: string | null,
    latitude: number,
    longitude: number,
    speed: number,
    timestamp: Date,
  ): Promise<UserLocation> {
    return prisma.userLocation.create({
      data: {
        userId,
        runId,
        latitude,
        longitude,
        speed,
        timestamp,
      },
    });
  }

  /**
   * Complete a run by updating overall stats and setting end time.
   */
  async complete(
    id: string,
    data: {
      endTime: Date;
      distance: number;
      duration: number;
      averageSpeed: number;
      xpGained: number;
    },
  ): Promise<Run> {
    return prisma.run.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a run by its ID.
   */
  async delete(id: string): Promise<Run> {
    return prisma.run.delete({
      where: { id },
    });
  }
}
