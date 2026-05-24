import { FastifyInstance } from 'fastify';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../validators/profile.validator';

/**
 * Fastify plugin registering profile retrieval and configuration updates endpoints.
 * All routes in this block require authorization.
 */
export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new ProfileController();

  // Enforce JWT Auth for all endpoints
  fastify.addHook('preHandler', authMiddleware);

  // Retrieve own profile consolidated statistics
  fastify.get('/me', controller.me);

  // Fetch another user's profile details by ID
  fastify.get('/:userId', controller.getById);

  // Update account configurations
  fastify.put('/', { preHandler: validate(updateProfileSchema, 'body') }, controller.update);

  // Upload user avatar photo
  fastify.post('/avatar', controller.avatar);
}
export default profileRoutes;
