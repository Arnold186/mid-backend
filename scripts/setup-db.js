const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect to default postgres database first
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL server...');
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'mid_backend';
    
    // Check if database exists
    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists`);
    } else {
      console.log(`📦 Creating database "${dbName}"...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully`);
    }

    await adminClient.end();
    console.log('✅ Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run prisma:generate');
    console.log('   2. Run: npm run prisma:migrate');
    console.log('   3. Run: npm run prisma:seed (optional)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Username and password in .env are correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Port number (5432) is correct');
    }
    process.exit(1);
  }
}

setupDatabase();
