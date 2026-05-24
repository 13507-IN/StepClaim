import { UserRepository } from '../repositories/user.repository';
import { BadgeRepository } from '../repositories/badge.repository';
import { RunRepository } from '../repositories/run.repository';
import { TerritoryRepository } from '../repositories/territory.repository';
import { cloudinary } from '../config/cloudinary';
import { User } from '@prisma/client';

export class ProfileService {
  private userRepo = new UserRepository();
  private badgeRepo = new BadgeRepository();
  private runRepo = new RunRepository();
  private territoryRepo = new TerritoryRepository();

  /**
   * Fetch complete consolidated user profile statistics, history, and achievements.
   */
  async getProfile(userId: string): Promise<{
    user: User;
    badges: any[];
    runs: any[];
    territoriesCount: number;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const badges = await this.badgeRepo.findByUserId(userId);
    const runs = await this.runRepo.findByUserId(userId, 10, 0);
    const territoriesCount = await this.territoryRepo.countByOwnerId(userId);

    return {
      user,
      badges: badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        unlockedAt: ub.unlockedAt,
      })),
      runs,
      territoriesCount,
    };
  }

  /**
   * Update core user account details.
   */
  async updateProfile(userId: string, data: { username?: string; email?: string }): Promise<User> {
    if (data.username) {
      const existing = await this.userRepo.findByUsername(data.username);
      if (existing && existing.id !== userId) {
        throw new Error('Username already taken');
      }
    }

    if (data.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new Error('Email address already registered');
      }
    }

    return this.userRepo.update(userId, data);
  }

  /**
   * Upload user avatar photo directly to Cloudinary and commit URL.
   */
  async uploadAvatar(userId: string, avatarBuffer: Buffer): Promise<User> {
    const avatarUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'stepclaim_avatars' },
        (error, result) => {
          if (error || !result) {
            return reject(new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(avatarBuffer);
    });

    return this.userRepo.update(userId, { avatarUrl });
  }
}
