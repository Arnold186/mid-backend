import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createDatabase() {
  try {
    // First, connect without specifying a database to create it
    const { PrismaClient: PrismaClientWithoutDB } = require('@prisma/client');
    const prismaWithoutDB = new PrismaClientWithoutDB({
      datasources: {
        db: {
          url: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/postgres') || 
              `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`
        }
      }
    });

    console.log('Connecting to PostgreSQL server...');
    await prismaWithoutDB.$connect();
    console.log('✅ Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'mid_backend';
    
    // Check if database exists
    const result = await prismaWithoutDB.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(SELECT datname FROM pg_database WHERE datname = ${dbName})
    `;

    if (result[0]?.exists) {
      console.log(`✅ Database "${dbName}" already exists`);
    } else {
      console.log(`Creating database "${dbName}"...`);
      await prismaWithoutDB.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully`);
    }

    await prismaWithoutDB.$disconnect();

    // Now connect to the new database and run migrations
    console.log(`Connecting to database "${dbName}"...`);
    await prisma.$connect();
    console.log(`✅ Connected to database "${dbName}"`);
    
    await prisma.$disconnect();
    console.log('✅ Database setup complete!');
    
  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
    if (error.code === 'P1000') {
      console.error('\n💡 Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Database credentials in .env are correct');
      console.error('   3. User "postgres" has permission to create databases');
    }
    process.exit(1);
  }
}

createDatabase();
