import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

/**
 * PostGIS Service — encapsulates all raw spatial SQL queries.
 *
 * Uses Prisma's $queryRaw / $executeRaw to call PostGIS functions
 * (ST_MakePoint, ST_DWithin, ST_Distance, ST_Length, ST_MakeLine)
 * on geography(Point, 4326) columns indexed with GIST.
 */
export class PostgisService {
  /**
   * Find all user_locations within a radius (in meters) of a given point.
   */
  async findLocationsWithinRadius(
    lat: number,
    lng: number,
    radiusMeters: number,
    limit = 1000,
  ): Promise<
    {
      id: string;
      user_id: string;
      run_id: string | null;
      latitude: number;
      longitude: number;
      speed: number;
      timestamp: Date;
      distance_meters: number;
    }[]
  > {
    return prisma.$queryRaw`
      SELECT
        id,
        user_id,
        run_id,
        latitude,
        longitude,
        speed,
        "timestamp",
        ST_Distance(
          geog,
          ST_MakePoint(${lng}::float8, ${lat}::float8)::geography
        ) AS distance_meters
      FROM user_locations
      WHERE geog IS NOT NULL
        AND ST_DWithin(
          geog,
          ST_MakePoint(${lng}::float8, ${lat}::float8)::geography,
          ${radiusMeters}::float8
        )
      ORDER BY distance_meters ASC
      LIMIT ${limit}
    `;
  }

  /**
   * Find all territories within a radius (in meters) of a given point.
   * Returns territory data with owner info, using a PostGIS spatial index query.
   */
  async findTerritoriesWithinRadius(
    lat: number,
    lng: number,
    radiusMeters: number,
  ): Promise<
    {
      id: string;
      grid_id: string;
      owner_id: string | null;
      captured_at: Date;
      last_activity: Date;
      capture_points: number;
      distance_meters: number;
      owner_username: string | null;
      owner_avatar_url: string | null;
    }[]
  > {
    return prisma.$queryRaw`
      SELECT
        t.id,
        t.grid_id,
        t.owner_id,
        t.captured_at,
        t.last_activity,
        t.capture_points,
        ST_Distance(
          t.center_geog,
          ST_MakePoint(${lng}::float8, ${lat}::float8)::geography
        ) AS distance_meters,
        u.username AS owner_username,
        u.avatar_url AS owner_avatar_url
      FROM territories t
      LEFT JOIN users u ON u.id = t.owner_id
      WHERE t.center_geog IS NOT NULL
        AND ST_DWithin(
          t.center_geog,
          ST_MakePoint(${lng}::float8, ${lat}::float8)::geography,
          ${radiusMeters}::float8
        )
      ORDER BY distance_meters ASC
    `;
  }

  /**
   * Calculate the total route distance (in meters) for a run using PostGIS.
   * Builds a LineString from ordered trackpoints and computes geodesic length.
   */
  async calculateRouteDistance(runId: string): Promise<number> {
    const result = await prisma.$queryRaw<{ route_length_meters: number | null }[]>`
      SELECT
        ST_Length(
          ST_MakeLine(geog::geometry ORDER BY "timestamp")::geography
        ) AS route_length_meters
      FROM user_locations
      WHERE run_id = ${runId}
        AND geog IS NOT NULL
    `;

    return result[0]?.route_length_meters ?? 0;
  }

  /**
   * Populate the geog column for a user_location row from its lat/lng.
   * Called after a Prisma INSERT to backfill the geography point.
   */
  async setLocationGeog(locationId: string, lat: number, lng: number): Promise<void> {
    await prisma.$executeRaw`
      UPDATE user_locations
      SET geog = ST_MakePoint(${lng}::float8, ${lat}::float8)::geography
      WHERE id = ${locationId}
    `;
  }

  /**
   * Populate the center_geog column for a territory row.
   * Called when a territory is captured/created to set its spatial center.
   */
  async setTerritoryGeog(territoryId: string, lat: number, lng: number): Promise<void> {
    await prisma.$executeRaw`
      UPDATE territories
      SET center_geog = ST_MakePoint(${lng}::float8, ${lat}::float8)::geography
      WHERE id = ${territoryId}
    `;
  }

  /**
   * Backfill all existing user_locations rows that have lat/lng but no geog.
   */
  async backfillLocationGeog(): Promise<number> {
    const result = await prisma.$executeRaw`
      UPDATE user_locations
      SET geog = ST_MakePoint(longitude::float8, latitude::float8)::geography
      WHERE geog IS NULL
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    `;
    return result;
  }

  /**
   * Check if PostGIS extension is available and working.
   */
  async healthCheck(): Promise<{ available: boolean; version: string | null }> {
    try {
      const result = await prisma.$queryRaw<{ postgis_full_version: string }[]>`
        SELECT PostGIS_Full_Version() AS postgis_full_version
      `;
      return {
        available: true,
        version: result[0]?.postgis_full_version ?? null,
      };
    } catch (err) {
      return { available: false, version: null };
    }
  }
}
