import { FastifyRequest, FastifyReply } from 'fastify';
import { RunService } from '../services/run.service.js';
import { RunRepository } from '../repositories/run.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class RunController {
  private runService = new RunService();
  private runRepo = new RunRepository();

  /**
   * Start a run tracking session.
   */
  start = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const run = await this.runService.startRun(userId);
      reply.status(201).send(successResponse(run, 'Run started successfully'));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * End and commit an active run tracking session.
   */
  end = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { runId, activityType } = request.body as {
        runId: string;
        activityType: 'WALKING' | 'RUNNING' | 'CYCLING';
      };

      if (!runId || !activityType) {
        reply.status(400).send(errorResponse('Missing required fields'));
        return;
      }

      const result = await this.runService.endRun(runId, userId, activityType);
      reply.status(200).send(successResponse(result, 'Run ended successfully'));
    } catch (error: any) {
      reply.status(400).send(errorResponse(error.message));
    }
  };

  /**
   * Get paginated run history logs for the current user.
   */
  history = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const { limit, page } = request.query as { limit?: string; page?: string };
      const parsedLimit = limit ? parseInt(limit, 10) : 10;
      const parsedPage = page ? parseInt(page, 10) : 1;
      const skip = (parsedPage - 1) * parsedLimit;

      const runs = await this.runRepo.findByUserId(userId, parsedLimit, skip);
      reply.status(200).send(successResponse({ runs, page: parsedPage, limit: parsedLimit }, 'Run history retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };

  /**
   * Get detailed info of a specific run (including geolocations list).
   */
  details = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const userId = request.user?.userId;
      const { id } = request.params as { id: string };

      if (!userId) {
        reply.status(401).send(errorResponse('Unauthorized'));
        return;
      }

      const run = await this.runRepo.findById(id);
      if (!run) {
        reply.status(404).send(errorResponse('Run not found'));
        return;
      }

      if (run.userId !== userId) {
        reply.status(403).send(errorResponse('Forbidden'));
        return;
      }

      reply.status(200).send(successResponse(run, 'Run details retrieved successfully'));
    } catch (error: any) {
      reply.status(500).send(errorResponse(error.message));
    }
  };
}
