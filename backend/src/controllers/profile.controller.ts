import { FastifyRequest, FastifyReply } from 'fastify';
import { ProfileService } from '../services/profile.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { User } from '@prisma/client';

export class ProfileController {
  private profileService = new ProfileService();

  /**
   * Get the consolidated statistics and logs profile of the current authenticated user.
   */
  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const profile = await this.profileService.getProfile(userId);
      // Strip out password hash
      const { passwordHash, ...safeUser } = profile.user as any;
      profile.user = safeUser as User;

      reply.status(200).send(successResponse(profile, 'My profile retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get profile of any user by their unique ID.
   */
  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { userId } = request.params as { userId: string };
      if (!userId) {
        reply.status(400).send(errorResponse('User ID is required'));
        return;
      }

      const profile = await this.profileService.getProfile(userId);
      // Strip out email and password hash for privacy
      const { passwordHash, email, ...safeUser } = profile.user as any;
      profile.user = safeUser as User;

      reply.status(200).send(successResponse(profile, 'Profile retrieved successfully'));
    } catch (error: any) {
      reply.status(404).send(errorResponse(error.message));
    }
  };

  /**
   * Update authenticated user profile details.
   */
  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { username, email } = request.body as { username?: string; email?: string };
      if (!username && !email) {
        reply.status(400).send(errorResponse('Missing update fields'));
        return;
      }

      const user = await this.profileService.updateProfile(userId, { username, email });
      const { passwordHash, ...safeUser } = user as any;

      reply.status(200).send(successResponse(safeUser, 'Profile updated successfully'));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * Handle avatar uploads via multipart stream.
   */
  avatar = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      if (!request.isMultipart()) {
        reply.status(400).send(errorResponse('Request must be multipart/form-data'));
        return;
      }

      const part = await request.file();
      if (!part || part.fieldname !== 'avatar') {
        reply.status(400).send(errorResponse('Missing avatar file part'));
        return;
      }

      const fileBuffer = await part.toBuffer();
      const user = await this.profileService.uploadAvatar(userId, fileBuffer);
      const { passwordHash, ...safeUser } = user as any;

      reply.status(200).send(successResponse(safeUser, 'Avatar image uploaded successfully'));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };
}
