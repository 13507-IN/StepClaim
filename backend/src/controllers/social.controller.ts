import { FastifyRequest, FastifyReply } from 'fastify';
import { SocialService } from '../services/social.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class SocialController {
  private socialService = new SocialService();

  /**
   * Send a friend invite by username.
   */
  sendRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { username } = request.body as { username: string };
      if (!username) {
        reply.status(400).send(errorResponse('Username is required'));
        return;
      }

      const invite = await this.socialService.sendFriendRequest(userId, username);
      reply.status(201).send(successResponse(invite, 'Friend request sent successfully'));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * Accept or reject a friend invitation.
   */
  respondRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { requestId, action } = request.body as {
        requestId: string;
        action: 'ACCEPT' | 'DECLINE' | 'BLOCK';
      };

      if (!requestId || !action) {
        reply.status(400).send(errorResponse('Missing required fields'));
        return;
      }

      const result = await this.socialService.respondToRequest(requestId, userId, action);
      reply.status(200).send(successResponse(result, `Request ${action.toLowerCase()}ed successfully`));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * Get the accepted friends list.
   */
  listFriends = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const friends = await this.socialService.getFriends(userId);
      reply.status(200).send(successResponse(friends, 'Friends list retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get incoming/outgoing pending friend invitations.
   */
  listPending = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const pending = await this.socialService.getPendingRequests(userId);
      reply.status(200).send(successResponse(pending, 'Pending invites retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get social activity timeline feed.
   */
  activityFeed = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { limit, page } = request.query as { limit?: string; page?: string };
      const parsedLimit = limit ? parseInt(limit, 10) : 20;
      const parsedPage = page ? parseInt(page, 10) : 1;

      const feed = await this.socialService.getActivityFeed(userId, parsedLimit, parsedPage);
      reply.status(200).send(successResponse(feed, 'Activity feed retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Search users by username.
   */
  search = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { q } = request.query as { q?: string };
      if (!q || q.trim() === '') {
        reply.status(200).send(successResponse([], 'Search results'));
        return;
      }

      const results = await this.socialService.searchUsers(q, userId);
      reply.status(200).send(successResponse(results, 'Search results retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };
}
