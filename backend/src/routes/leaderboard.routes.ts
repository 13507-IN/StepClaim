import { FastifyInstance } from 'fastify';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { getLeaderboardSchema } from '../validators/leaderboard.validator';

/**
 * Fastify plugin registering game leaderboard ranking endpoints.
 * All routes in this block require authorization.
 */
export async function leaderboardRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new LeaderboardController();

  // Enforce JWT Auth for all endpoints
  fastify.addHook('preHandler', authMiddleware);

  // Retrieve filtered leaderboards
  fastify.get('/', { preHandler: validate(getLeaderboardSchema, 'query') }, controller.getRanking);
}
export default leaderboardRoutes;
