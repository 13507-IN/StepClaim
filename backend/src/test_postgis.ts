import { prisma } from './config/database.js';
import { PostgisService } from './services/postgis.service.js';

/**
 * PostGIS Integration Test — verifies spatial queries work end-to-end.
 */
async function testPostgis() {
  console.log('🧪 PostGIS Integration Test\n');
  const postgis = new PostgisService();

  try {
    // 1. Health check
    console.log('1️⃣  Health Check...');
    const health = await postgis.healthCheck();
    console.log(`   PostGIS available: ${health.available}`);
    console.log(`   Version: ${health.version}\n`);
    if (!health.available) {
      console.error('❌ PostGIS is not available. Aborting test.');
      return;
    }

    // 2. Find or create a test user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: 'postgis_test_' + Date.now(),
          email: `postgis_${Date.now()}@test.com`,
          passwordHash: 'hashed_password_123',
        },
      });
    }
    console.log(`👤 Test user: ${user.username} (${user.id})\n`);

    // 3. Create a test run
    const run = await prisma.run.create({
      data: {
        userId: user.id,
        startTime: new Date(Date.now() - 300_000),
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        xpGained: 0,
      },
    });
    console.log(`🏁 Test run: ${run.id}\n`);

    // 4. Insert 5 trackpoints along a ~1km route (each ~200-250m apart)
    console.log('📡 Inserting 5 trackpoints with PostGIS geog...');
    const points = [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7150, lng: -74.0060 },
      { lat: 40.7170, lng: -74.0060 },
      { lat: 40.7190, lng: -74.0060 },
      { lat: 40.7210, lng: -74.0060 },
    ];

    for (let i = 0; i < points.length; i++) {
      const loc = await prisma.userLocation.create({
        data: {
          userId: user.id,
          runId: run.id,
          latitude: points[i].lat,
          longitude: points[i].lng,
          speed: 3.5,
          timestamp: new Date(Date.now() - (300_000 - i * 60_000)),
        },
      });
      // The trigger should auto-populate geog, but let's also call setLocationGeog as backup
      await postgis.setLocationGeog(loc.id, points[i].lat, points[i].lng);
      console.log(`   Point ${i + 1}: [${points[i].lat}, ${points[i].lng}] ✅`);
    }
    console.log('');

    // 5. Test ST_DWithin — find locations within 2km of center
    console.log('5️⃣  Testing ST_DWithin (locations within 2km of 40.715, -74.006)...');
    const nearby = await postgis.findLocationsWithinRadius(40.715, -74.006, 2000);
    console.log(`   Found ${nearby.length} locations within 2km`);
    if (nearby.length > 0) {
      console.log(`   Closest: ${nearby[0].distance_meters?.toFixed(1)}m away`);
      console.log(`   Farthest: ${nearby[nearby.length - 1].distance_meters?.toFixed(1)}m away`);
    }
    console.log('');

    // 6. Test ST_Length(ST_MakeLine) — calculate route distance
    console.log('6️⃣  Testing ST_Length(ST_MakeLine) for route distance...');
    const routeDistance = await postgis.calculateRouteDistance(run.id);
    console.log(`   Route distance: ${routeDistance.toFixed(1)} meters (${(routeDistance / 1000).toFixed(3)} km)`);
    console.log('');

    // 7. Validate results
    console.log('━━━ RESULTS ━━━');
    const tests = [
      { name: 'PostGIS health check', pass: health.available },
      { name: 'ST_DWithin found locations', pass: nearby.length >= 5 },
      { name: 'Route distance > 0', pass: routeDistance > 0 },
      { name: 'Route distance ~0.9-1.0 km', pass: routeDistance > 800 && routeDistance < 1200 },
    ];

    let allPass = true;
    for (const t of tests) {
      const icon = t.pass ? '✅' : '❌';
      console.log(`   ${icon} ${t.name}`);
      if (!t.pass) allPass = false;
    }
    console.log('');

    if (allPass) {
      console.log('🎉 ALL TESTS PASSED — PostGIS is fully operational!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }

    // 8. Cleanup test data
    await prisma.userLocation.deleteMany({ where: { runId: run.id } });
    await prisma.run.delete({ where: { id: run.id } });
    console.log('\n🧹 Cleaned up test data.');

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPostgis();
