import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

/**
 * Extend FastifyRequest to include the authenticated user payload.
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Fastify preHandler hook that authenticates requests via JWT.
 * Extracts the token from the Authorization header (Bearer scheme)
 * or from a cookie named 'accessToken'.
 *
 * On success, attaches the decoded user payload to `request.user`.
 * On failure, responds with 401 Unauthorized.
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    let token: string | undefined;

    // Try Authorization header first
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // Fall back to cookie
    if (!token) {
      const cookies = request.cookies as Record<string, string> | undefined;
      token = cookies?.accessToken;
    }

    if (!token) {
      reply.status(401).send(errorResponse('Authentication required'));
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      reply.status(401).send(errorResponse('Invalid or expired token'));
      return;
    }

    request.user = {
      userId: decoded.userId,
      username: decoded.username || '',
    };
  } catch (error) {
    reply.status(401).send(errorResponse('Invalid or expired token'));
  }
}

