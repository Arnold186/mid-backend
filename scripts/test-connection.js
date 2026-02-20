const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');
  console.log('Connection details:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
  console.log(`  Database: postgres (testing connection)\n`);

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('\n📊 PostgreSQL Version:');
    console.log(`   ${result.rows[0].version.split(',')[0]}\n`);
    
    await client.end();
    
    console.log('💡 Next steps:');
    console.log('   1. If connection works, run: npm run db:setup');
    console.log('   2. If connection fails, check your PostgreSQL password');
    console.log('   3. You can also create the database manually using psql:');
    console.log(`      psql -U ${process.env.DB_USER || 'postgres'} -c "CREATE DATABASE ${process.env.DB_NAME || 'mid_backend'};"`);
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Verify your password in .env file');
    console.error('   3. Check if PostgreSQL is configured to accept connections');
    console.error('   4. Try connecting manually:');
    console.error(`      psql -U ${process.env.DB_USER || 'postgres'} -h ${process.env.DB_HOST || 'localhost'} -p ${process.env.DB_PORT || '5432'}`);
    console.error('\n📝 To reset PostgreSQL password (if needed):');
    console.error('   - Open pgAdmin or use psql');
    console.error('   - Or edit pg_hba.conf and restart PostgreSQL');
    process.exit(1);
  }
}

testConnection();
