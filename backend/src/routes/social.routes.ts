import { FastifyInstance } from 'fastify';
import { SocialController } from '../controllers/social.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendFriendRequestSchema, respondFriendRequestSchema } from '../validators/social.validator';

/**
 * Fastify plugin registering social friend systems and activity feeds.
 * All routes in this block require authorization.
 */
export async function socialRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new SocialController();

  // Enforce JWT Auth for all social endpoints
  fastify.addHook('preHandler', authMiddleware);

  // Send friend invitation
  fastify.post('/request', { preHandler: validate(sendFriendRequestSchema, 'body') }, controller.sendRequest);

  // Respond to friend invitation
  fastify.post('/respond', { preHandler: validate(respondFriendRequestSchema, 'body') }, controller.respondRequest);

  // List accepted friends list
  fastify.get('/friends', controller.listFriends);

  // List incoming and outgoing pending invitations
  fastify.get('/pending', controller.listPending);

  // Fetch social activity timeline
  fastify.get('/activity-feed', controller.activityFeed);

  // Search user directory
  fastify.get('/search', controller.search);
}
export default socialRoutes;
