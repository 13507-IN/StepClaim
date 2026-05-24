import { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { REDIS_KEYS } from '../config/constants.js';
import { errorResponse } from '../utils/response.js';

/**
 * Redis-based rate limiting middleware.
 * Uses a sliding window counter approach per IP address.
 *
 * @param maxRequests - Maximum number of requests allowed within the window (defaults to env value)
 * @param windowSeconds - Time window in seconds (defaults to env value)
 * @returns Fastify preHandler function
 */
export function rateLimit(
  maxRequests?: number,
  windowSeconds?: number,
) {
  const max = maxRequests ?? env.RATE_LIMIT_MAX;
  const window = windowSeconds ?? env.RATE_LIMIT_WINDOW_SECONDS;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const identifier = request.ip;
    const key = `${REDIS_KEYS.RATE_LIMIT}${identifier}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, window);
      }

      // Set rate limit headers
      const ttl = await redis.ttl(key);
      reply.header('X-RateLimit-Limit', max);
      reply.header('X-RateLimit-Remaining', Math.max(0, max - current));
      reply.header('X-RateLimit-Reset', ttl);

      if (current > max) {
        reply.status(429).send(
          errorResponse('Too many requests. Please try again later.'),
        );
      }
    } catch (error) {
      // If Redis is down, allow the request through (fail-open)
      request.log.warn('Rate limiting unavailable: Redis error');
    }
  };
}
