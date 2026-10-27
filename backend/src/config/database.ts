import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    // Fix common Supabase pooler misconfiguration
    if (parsed.hostname && parsed.hostname.includes('saumhfabdgbnhxkruxhk') && !parsed.hostname.includes('pooler') && !parsed.hostname.includes('supabase.co')) {
      // If someone set host to project ref, use correct direct host
      parsed.hostname = 'db.saumhfabdgbnhxkruxhk.supabase.co';
      parsed.port = parsed.port || '5432';
      return parsed.toString();
    }
  } catch {}
  return url;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
