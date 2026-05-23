import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * Uses the globalThis pattern to prevent multiple Prisma Client instances
 * during hot-reloading in development. In production, a single instance
 * is created and reused.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
