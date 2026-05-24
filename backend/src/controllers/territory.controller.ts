import { FastifyRequest, FastifyReply } from 'fastify';
import { TerritoryService } from '../services/territory.service.js';
import { TerritoryRepository } from '../repositories/territory.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class TerritoryController {
  private territoryService = new TerritoryService();
  private territoryRepo = new TerritoryRepository();

  /**
   * Get captured and uncaptured territories surrounding a user's coordinate.
   */
  nearby = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { latitude, longitude } = request.query as { latitude?: string; longitude?: string };

      if (!latitude || !longitude) {
        reply.status(400).send(errorResponse('Missing coordinates (latitude/longitude)'));
        return;
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        reply.status(400).send(errorResponse('Invalid coordinate format'));
        return;
      }

      const territories = await this.territoryService.getNearbyTerritories(lat, lng);
      reply.status(200).send(successResponse(territories, 'Nearby territories retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get all captured territories owned by the authenticated user.
   */
  mine = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const territories = await this.territoryRepo.findByOwnerId(userId);
      reply.status(200).send(successResponse(territories, 'Your territories retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get global and personal territory count statistics.
   */
  stats = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const userCount = await this.territoryRepo.countByOwnerId(userId);
      const globalCount = await this.territoryRepo.countAll();

      reply.status(200).send(
        successResponse(
          {
            userOwnedCount: userCount,
            globalCapturedCount: globalCount,
          },
          'Territory statistics retrieved successfully',
        ),
      );
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };
}
