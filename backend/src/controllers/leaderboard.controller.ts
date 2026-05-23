import { FastifyRequest, FastifyReply } from 'fastify';
import { LeaderboardService } from '../services/leaderboard.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class LeaderboardController {
  private leaderboardService = new LeaderboardService();

  /**
   * Get leaderboard rankings based on parameters.
   */
  getRanking = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { type, period, page, limit } = request.query as {
        type?: 'XP' | 'DISTANCE' | 'TERRITORIES';
        period?: 'GLOBAL' | 'WEEKLY' | 'FRIENDS';
        page?: string;
        limit?: string;
      };

      const parsedType = type || 'XP';
      const parsedPeriod = period || 'GLOBAL';
      const parsedPage = page ? parseInt(page, 10) : 1;
      const parsedLimit = limit ? parseInt(limit, 10) : 20;

      const ranking = await this.leaderboardService.getLeaderboard(
        userId,
        parsedType,
        parsedPeriod,
        parsedLimit,
        parsedPage,
      );

      reply.status(200).send(
        successResponse({
          rankings: ranking,
          type: parsedType,
          period: parsedPeriod,
          page: parsedPage,
          limit: parsedLimit,
        }, 'Leaderboard rankings retrieved successfully'),
      );
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };
}
