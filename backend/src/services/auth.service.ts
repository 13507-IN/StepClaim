import { UserRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { redis } from '../config/redis.js';
import { cloudinary } from '../config/cloudinary.js';
import { User } from '@prisma/client';

export class AuthService {
  private userRepo = new UserRepository();

  /**
   * Register a new user, upload avatar if provided.
   */
  async register(
    username: string,
    email: string,
    passwordStr: string,
    avatarFileBuffer?: Buffer,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user exists
    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email address already registered');
    }

    const existingUsername = await this.userRepo.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Upload avatar to Cloudinary if provided
    let avatarUrl: string | null = null;
    if (avatarFileBuffer) {
      avatarUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'stepclaim_avatars' },
          (error, result) => {
            if (error || !result) {
              return reject(new Error('Cloudinary upload failed'));
            }
            resolve(result.secure_url);
          },
        );
        uploadStream.end(avatarFileBuffer);
      });
    }

    // Hash password
    const passwordHash = await hashPassword(passwordStr);

    // Create user
    const user = await this.userRepo.create({
      username,
      email,
      passwordHash,
      avatarUrl,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Save refresh token in Redis (expires in 7 days matching JWT expiration)
    await redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user by validating credentials and returning fresh tokens.
   */
  async login(
    email: string,
    passwordStr: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(passwordStr, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Save refresh token in Redis
    await redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh the access and refresh tokens.
   */
  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid refresh token');
      }
      
      // Verify token exists in Redis
      const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
      if (!storedToken || storedToken !== token) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const accessToken = generateAccessToken({ userId: decoded.userId, username: decoded.username || '' });
      const refreshToken = generateRefreshToken({ userId: decoded.userId });

      // Save refresh token in Redis
      await redis.set(`refreshToken:${decoded.userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Log out a user by deleting their refresh token from Redis.
   */
  async logout(userId: string): Promise<void> {
    await redis.del(`refreshToken:${userId}`);
  }

  /**
   * Get the current user profile.
   */
  async getMe(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
