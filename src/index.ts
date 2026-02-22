import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';
import reportRoutes from './routes/report.routes';
import { globalErrorHandler } from './middleware/errorHandler';
import path from 'path';
import { readFileSync } from 'fs';

const swaggerDocument = JSON.parse(
  readFileSync(path.join(process.cwd(), 'src', 'swagger.json'), 'utf-8')
);

const app = express();
const PORT = process.env.PORT || 1085;
const prisma = new PrismaClient();

// Database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to the Mid Backend API',
    docs: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(globalErrorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server after database connection is verified
checkDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
