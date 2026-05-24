import { FastifyInstance } from 'fastify';
import { RunController } from '../controllers/run.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { startRunSchema } from '../validators/run.validator';

/**
 * Fastify plugin registering run / GPS activity tracking endpoints.
 * All routes in this block require authorization.
 */
export async function runRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new RunController();

  // Enforce JWT Auth for all endpoints in this group
  fastify.addHook('preHandler', authMiddleware);

  // Start activity session
  fastify.post('/start', controller.start);

  // Stop/Commit activity session
  fastify.post('/end', controller.end);

  // Retrieve paginated historical runs
  fastify.get('/history', controller.history);

  // Fetch specific run details (by run UUID)
  fastify.get('/:id', controller.details);
}
export default runRoutes;
