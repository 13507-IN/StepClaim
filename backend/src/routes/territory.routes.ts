import { FastifyInstance } from 'fastify';
import { TerritoryController } from '../controllers/territory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { getNearbyTerritoriesSchema } from '../validators/territory.validator';

/**
 * Fastify plugin registering H3 territory hexagonal grids lookup endpoints.
 * All routes in this block require authorization.
 */
export async function territoryRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new TerritoryController();

  // Enforce JWT Auth for all endpoints
  fastify.addHook('preHandler', authMiddleware);

  // Retrieve nearby hexagonal grid layout
  fastify.get('/nearby', { preHandler: validate(getNearbyTerritoriesSchema, 'query') }, controller.nearby);

  // Get user-owned captured grids
  fastify.get('/mine', controller.mine);

  // Fetch territory capture stats
  fastify.get('/stats', controller.stats);
}
export default territoryRoutes;
