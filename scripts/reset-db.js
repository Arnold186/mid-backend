const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'mid_backend';

  const adminClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    console.log('🔌 Connecting to PostgreSQL server...');
    await adminClient.connect();
    console.log('✅ Connected');

    // Terminate existing connections to allow DROP DATABASE on Windows
    await adminClient.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
      `,
      [dbName]
    );

    console.log(`🧹 Dropping database "${dbName}" (if exists)...`);
    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`📦 Creating database "${dbName}"...`);
    await adminClient.query(`CREATE DATABASE "${dbName}"`);

    console.log('✅ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. npm run prisma:migrate');
    console.log('   2. npm run prisma:seed (optional)');
  } finally {
    await adminClient.end();
  }
}

resetDatabase().catch((error) => {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
});

