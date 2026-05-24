import { z } from 'zod';

/**
 * Validation schema for capturing a territory.
 * Requires the user's GPS coordinates to determine the H3 cell.
 */
export const captureTerritorySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Inferred type from the capture territory schema */
export type CaptureTerritoryInput = z.infer<typeof captureTerritorySchema>;

/**
 * Validation schema for querying nearby territories.
 * Uses center coordinates and an optional radius.
 */
export const getNearbyTerritoriesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(50).optional().default(1),
});

/** Inferred type from the nearby territories schema */
export type GetNearbyTerritoriesInput = z.infer<typeof getNearbyTerritoriesSchema>;
