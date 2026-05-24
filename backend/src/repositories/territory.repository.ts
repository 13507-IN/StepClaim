import { prisma } from '../config/database';
import { Territory } from '@prisma/client';

/**
 * Repository handling territory capture grid database operations.
 */
export class TerritoryRepository {
  /**
   * Find a territory by its unique H3 grid ID index cell.
   */
  async findByGridId(gridId: string): Promise<Territory | null> {
    return prisma.territory.findUnique({
      where: { gridId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
    });
  }

  /**
   * Upsert a captured territory with new ownership details.
   */
  async upsertCapture(
    gridId: string,
    ownerId: string,
    capturePoints = 100,
  ): Promise<Territory> {
    return prisma.territory.upsert({
      where: { gridId },
      update: {
        ownerId,
        capturedAt: new Date(),
        lastActivity: new Date(),
        capturePoints,
      },
      create: {
        gridId,
        ownerId,
        capturedAt: new Date(),
        lastActivity: new Date(),
        capturePoints,
      },
    });
  }

  /**
   * Find all territories currently captured and owned by a user.
   */
  async findByOwnerId(ownerId: string): Promise<Territory[]> {
    return prisma.territory.findMany({
      where: { ownerId },
      orderBy: { capturedAt: 'desc' },
    });
  }

  /**
   * Find all captured territories within a specific set of H3 grid IDs.
   */
  async findNearby(gridIds: string[]): Promise<(Territory & { owner: { username: string; avatarUrl: string | null } | null })[]> {
    return prisma.territory.findMany({
      where: {
        gridId: {
          in: gridIds,
        },
      },
      include: {
        owner: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Count the number of territories owned by a user.
   */
  async countByOwnerId(ownerId: string): Promise<number> {
    return prisma.territory.count({
      where: { ownerId },
    });
  }

  /**
   * Find the total captured territories.
   */
  async countAll(): Promise<number> {
    return prisma.territory.count();
  }
}
