import { prisma } from '../config/database';
import { Prisma, User } from '@prisma/client';

/**
 * Repository handling user-related database transactions.
 */
export class UserRepository {
  /**
   * Find a user by their unique ID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by their email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by their username.
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Create a new user with standard details.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update a user's details by ID.
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update a user's XP, level, total distance, and territory count.
   */
  async updateStats(
    id: string,
    data: {
      xp?: number;
      level?: number;
      streak?: number;
      totalDistance?: number;
      territoryCount?: number;
    },
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Search users for friend requests matching username.
   */
  async searchUsers(query: string, excludeUserId: string): Promise<Partial<User>[]> {
    return prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        id: {
          not: excludeUserId,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        level: true,
      },
      take: 10,
    });
  }
}
