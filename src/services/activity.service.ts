import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
