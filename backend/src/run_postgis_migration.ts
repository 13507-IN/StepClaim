import { prisma } from './config/database.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Run the PostGIS migration SQL directly against the database.
 * This bypasses Prisma Migrate's drift detection and applies only
 * the new PostGIS columns, indexes, backfill, and trigger.
 */
async function runPostgisMigration() {
  console.log('🗺️  Running PostGIS Migration...\n');

  try {
    // 1. Check if PostGIS extension is available
    console.log('1️⃣  Checking PostGIS extension...');
    try {
      const version = await prisma.$queryRaw<{ postgis_full_version: string }[]>`
        SELECT PostGIS_Full_Version() AS postgis_full_version
      `;
      console.log(`   ✅ PostGIS is enabled: ${version[0]?.postgis_full_version}\n`);
    } catch (err: any) {
      console.log('   ⚠️  PostGIS not found, attempting to enable...');
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis`);
      console.log('   ✅ PostGIS extension enabled\n');
    }

    // 2. Add geog column to user_locations
    console.log('2️⃣  Adding geog column to user_locations...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "user_locations"
      ADD COLUMN IF NOT EXISTS "geog" geography(Point,4326)
    `);
    console.log('   ✅ geog column added\n');

    // 3. Add center_geog column to territories
    console.log('3️⃣  Adding center_geog column to territories...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "territories"
      ADD COLUMN IF NOT EXISTS "center_geog" geography(Point,4326)
    `);
    console.log('   ✅ center_geog column added\n');

    // 4. Create GIST spatial indexes
    console.log('4️⃣  Creating GIST spatial indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_locations_geog_idx"
      ON "user_locations" USING GIST ("geog")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "territories_center_geog_idx"
      ON "territories" USING GIST ("center_geog")
    `);
    console.log('   ✅ GIST indexes created\n');

    // 5. Backfill existing user_locations
    console.log('5️⃣  Backfilling existing user_locations with geog...');
    const backfilled = await prisma.$executeRawUnsafe(`
      UPDATE "user_locations"
      SET geog = ST_MakePoint(longitude::float8, latitude::float8)::geography
      WHERE geog IS NULL
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    `);
    console.log(`   ✅ Backfilled ${backfilled} rows\n`);

    // 6. Create auto-populate trigger
    console.log('6️⃣  Creating auto-populate trigger on user_locations...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION set_user_location_geog()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
          NEW.geog := ST_MakePoint(NEW.longitude::float8, NEW.latitude::float8)::geography;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS trg_set_user_location_geog ON "user_locations"
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_set_user_location_geog
        BEFORE INSERT OR UPDATE OF latitude, longitude
        ON "user_locations"
        FOR EACH ROW
        EXECUTE FUNCTION set_user_location_geog()
    `);
    console.log('   ✅ Trigger created\n');

    console.log('🎉 PostGIS Migration Complete!');
    console.log('   - user_locations.geog: geography(Point,4326) + GIST index');
    console.log('   - territories.center_geog: geography(Point,4326) + GIST index');
    console.log('   - Auto-populate trigger on user_locations INSERT/UPDATE');
    console.log('   - Existing rows backfilled from latitude/longitude');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runPostgisMigration();
