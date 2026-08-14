-- Enable PostGIS extension (should already be enabled in Supabase Dashboard)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography(Point,4326) column to user_locations
ALTER TABLE "user_locations"
  ADD COLUMN IF NOT EXISTS "geog" geography(Point,4326);

-- Add geography(Point,4326) column to territories
ALTER TABLE "territories"
  ADD COLUMN IF NOT EXISTS "center_geog" geography(Point,4326);

-- Create GIST spatial indexes for fast ST_DWithin queries
CREATE INDEX IF NOT EXISTS "user_locations_geog_idx"
  ON "user_locations" USING GIST ("geog");

CREATE INDEX IF NOT EXISTS "territories_center_geog_idx"
  ON "territories" USING GIST ("center_geog");

-- Backfill existing user_locations with geog from latitude/longitude
UPDATE "user_locations"
SET geog = ST_MakePoint(longitude::float8, latitude::float8)::geography
WHERE geog IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;

-- Backfill existing territories with center_geog
-- Since territories only have H3 grid_id (no lat/lng stored), we skip backfill here.
-- The center_geog will be populated going forward when captureTerritory() is called.

-- Create a trigger function to auto-populate geog on INSERT to user_locations
CREATE OR REPLACE FUNCTION set_user_location_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := ST_MakePoint(NEW.longitude::float8, NEW.latitude::float8)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to user_locations table
DROP TRIGGER IF EXISTS trg_set_user_location_geog ON "user_locations";
CREATE TRIGGER trg_set_user_location_geog
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON "user_locations"
  FOR EACH ROW
  EXECUTE FUNCTION set_user_location_geog();
