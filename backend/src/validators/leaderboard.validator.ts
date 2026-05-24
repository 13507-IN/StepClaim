import { z } from 'zod';

/**
 * Validation schema for leaderboard queries.
 * Supports different leaderboard types, time periods, and pagination.
 */
export const getLeaderboardSchema = z.object({
  type: z
    .enum(['xp', 'distance', 'territories'], {
      errorMap: () => ({ message: 'Type must be "xp", "distance", or "territories"' }),
    })
    .optional()
    .default('xp'),
  period: z
    .enum(['all', 'weekly', 'monthly'], {
      errorMap: () => ({ message: 'Period must be "all", "weekly", or "monthly"' }),
    })
    .optional()
    .default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/** Inferred type from the leaderboard schema */
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;
