import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

/**
 * Fastify plugin registering all user authentication endpoints.
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new AuthController();

  // Registration endpoint (supports multipart for avatar uploads)
  fastify.post('/register', controller.register);

  // Login endpoint
  fastify.post('/login', { preHandler: validate(loginSchema, 'body') }, controller.login);

  // Refresh tokens endpoint
  fastify.post('/refresh', controller.refresh);

  // Logout endpoint (clears active cookies and deletes Redis sessions)
  fastify.post('/logout', controller.logout);
}
export default authRoutes;
