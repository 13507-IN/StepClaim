import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the database with initial badge data.
 * Badges are core game achievements that players can unlock.
 */
async function main(): Promise<void> {
  console.log('🌱 Seeding badges...');

  const badges = [
    {
      name: 'Marathoner',
      description: 'Complete a 42.195km total distance',
      icon: '🏃',
    },
    {
      name: 'Territory King',
      description: 'Capture 100 territories',
      icon: '👑',
    },
    {
      name: 'Explorer',
      description: 'Visit 50 unique hexagons',
      icon: '🧭',
    },
    {
      name: '7 Day Streak',
      description: 'Maintain a 7-day running streak',
      icon: '🔥',
    },
    {
      name: 'Speed Runner',
      description: 'Maintain 8+ m/s average speed for a run',
      icon: '⚡',
    },
    {
      name: 'Night Runner',
      description: 'Complete a run between 10 PM and 5 AM',
      icon: '🌙',
    },
    {
      name: 'Early Bird',
      description: 'Complete a run before 6 AM',
      icon: '🌅',
    },
    {
      name: '100km Club',
      description: 'Reach 100km total distance',
      icon: '💯',
    },
    {
      name: 'First Capture',
      description: 'Capture your first territory',
      icon: '🏴',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {
        description: badge.description,
        icon: badge.icon,
      },
      create: badge,
    });

    console.log(`  ✅ Badge "${badge.name}" ${badge.icon}`);
  }

  console.log(`\n🎉 Seeded ${badges.length} badges successfully!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
