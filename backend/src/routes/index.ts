import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { runRoutes } from './run.routes';
import { territoryRoutes } from './territory.routes';
import { leaderboardRoutes } from './leaderboard.routes';
import { socialRoutes } from './social.routes';
import { profileRoutes } from './profile.routes';

/**
 * Fastify plugin combining and registering all StepClaim API routes under /api/v1.
 */
export async function apiRoutes(fastify: FastifyInstance): Promise<void> {
  // Unprotected / Auth routes
  fastify.register(authRoutes, { prefix: '/auth' });

  // Protected game routes
  fastify.register(runRoutes, { prefix: '/runs' });
  fastify.register(territoryRoutes, { prefix: '/territories' });
  fastify.register(leaderboardRoutes, { prefix: '/leaderboard' });
  fastify.register(socialRoutes, { prefix: '/social' });
  fastify.register(profileRoutes, { prefix: '/profile' });
}
export default apiRoutes;
