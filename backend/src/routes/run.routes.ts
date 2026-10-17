import { FastifyInstance } from 'fastify';
import { RunController } from '../controllers/run.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  endRunSchema,
  locationUpdateSchema,
  runHistoryQuerySchema,
} from '../validators/run.validator';
import { rateLimit } from '../middleware/rateLimit.middleware';

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

  // Send location trackpoint update via HTTP REST
  fastify.post('/location', {
    preHandler: [rateLimit(120, 60), validate(locationUpdateSchema, 'body')],
  }, controller.trackpoint);

  // Stop/Commit activity session
  fastify.post('/end', { preHandler: validate(endRunSchema, 'body') }, controller.end);

  // Retrieve paginated historical runs
  fastify.get('/history', {
    preHandler: validate(runHistoryQuerySchema, 'query'),
  }, controller.history);

  // Fetch specific run details (by run UUID)
  fastify.get('/:id', controller.details);
}
export default runRoutes;
