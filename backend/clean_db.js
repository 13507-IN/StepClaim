const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No connection string found in environment variables.');
  process.exit(1);
}

console.log('Connecting to database to clean up...');
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();
  console.log('Connected successfully!');

  // List of tables to drop
  const tables = [
    'user_locations',
    'runs',
    'users',
    'territories',
    'activities',
    'badges',
    'user_badges',
    'friends',
    'cheat_logs',
    '_prisma_migrations'
  ];

  console.log('Dropping tables with CASCADE to clean up cross-schema constraints...');
  for (const table of tables) {
    try {
      await client.query(`DROP TABLE IF EXISTS "public"."${table}" CASCADE;`);
      console.log(`Dropped table public.${table} (if it existed)`);
    } catch (err) {
      console.error(`Error dropping table public.${table}:`, err.message);
    }
  }

  // Check remaining tables
  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    console.log('Remaining tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error listing remaining tables:', err.message);
  }

  await client.end();
  console.log('Done!');
}

main().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
