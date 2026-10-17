import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { corsOrigins, env } from './config/env';
import { apiRoutes } from './routes';
import { initSocketServer } from './socket';
import { disconnectRedis } from './config/redis';
import { prisma } from './config/database';

/**
 * Main application bootstrapping.
 */
async function bootstrap(): Promise<void> {
  // Test Database Connection on startup
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL (Supabase) Database: connected successfully');
  } catch (dbError: any) {
    console.error('❌ PostgreSQL Database connection error:', dbError.message);
  }

  const fastify = Fastify({
    logger: {
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  try {
    // 1. Register Core Fastify Plugins
    await fastify.register(cors, {
      origin: corsOrigins,
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Reject browser-originated state changes from non-allowlisted sites.
    // This is needed when production refresh cookies use SameSite=None.
    fastify.addHook('onRequest', async (request, reply) => {
      const origin = request.headers.origin;
      const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        request.method,
      );
      if (
        isStateChangingMethod &&
        origin &&
        !corsOrigins.includes(origin)
      ) {
        return reply
          .status(403)
          .send({ success: false, message: 'Origin not allowed' });
      }
    });

    await fastify.register(cookie, {
      secret: env.COOKIE_SECRET,
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    });

    // 2. Health check endpoint
    fastify.get('/health', async () => {
      return { status: 'OK', timestamp: new Date().toISOString() };
    });

    // 3. Register consolidated API routes
    await fastify.register(apiRoutes, { prefix: '/api/v1' });

    // 4. Initialize Socket.IO Server
    await initSocketServer(fastify);

    // 5. Start listening for incoming network requests
    const host = '0.0.0.0';
    const port = env.PORT;

    await fastify.listen({ port, host });
    console.log(`🚀 Server listening on http://localhost:${port}`);
    console.log(`🩺 Health check URL: http://localhost:${port}/health`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }

  // Graceful shutdown handlers
  const shutdown = async () => {
    console.log('🔄 Server shutting down...');
    try {
      await disconnectRedis();
      await fastify.close();
      console.log('✅ Server stopped successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during server shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap();
