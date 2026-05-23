import Redis from 'ioredis';
import { env } from './env.js';

/**
 * Redis client instance configured from environment variables.
 * Handles connection lifecycle events with appropriate logging.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 10) {
      console.error('❌ Redis: max retries reached, giving up');
      return null;
    }
    // Exponential backoff: 200ms, 400ms, 800ms, ... capped at 5s
    return Math.min(times * 200, 5000);
  },
  lazyConnect: false,
});

// ─── Connection Event Handlers ──────────────────────────────────────────────

redis.on('connect', () => {
  console.log('✅ Redis: connected successfully');
});

redis.on('error', (error: Error) => {
  console.error('❌ Redis connection error:', error.message);
});

redis.on('close', () => {
  console.warn('⚠️  Redis: connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: reconnecting...');
});

/**
 * Gracefully disconnect the Redis client.
 * Should be called during application shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log('✅ Redis: disconnected gracefully');
  } catch (error) {
    console.error('❌ Redis: error during disconnect', error);
    redis.disconnect();
  }
}
