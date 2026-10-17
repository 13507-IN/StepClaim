import { z } from 'zod';

export const locationUpdateSchema = z.object({
  runId: z.string().uuid('Invalid run ID'),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  speed: z.number().finite().min(0).max(100).default(0),
  accuracy: z.number().finite().min(0).max(1000),
  activityType: z.enum(['WALKING', 'RUNNING', 'CYCLING']),
});

export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;

export const endRunSchema = z.object({
  runId: z.string().uuid('Invalid run ID'),
  activityType: z.enum(['WALKING', 'RUNNING', 'CYCLING']),
});

export type EndRunInput = z.infer<typeof endRunSchema>;

export const runHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type RunHistoryQuery = z.infer<typeof runHistoryQuerySchema>;
