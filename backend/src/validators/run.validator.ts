import { z } from 'zod';

/**
 * Validation schema for starting a new run.
 * Requires the user's starting GPS coordinates.
 */
export const startRunSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Inferred type from the start run schema */
export type StartRunInput = z.infer<typeof startRunSchema>;

/**
 * Validation schema for a GPS location update during a run.
 * Includes position, optional speed, and a client-side timestamp.
 */
export const locationUpdateSchema = z.object({
  runId: z.string().uuid('Invalid run ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).optional().default(0),
  timestamp: z.string().datetime().or(z.number()),
});

/** Inferred type from the location update schema */
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
