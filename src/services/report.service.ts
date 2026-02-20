import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserActivityReport(userId: string, limit = 50) {
  const logs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const favoritesCount = await prisma.favorite.count({
    where: { userId },
  });

  return {
    userId,
    favoritesCount,
    recentActivity: logs.map((log) => ({
      id: log.id,
      action: log.action,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      createdAt: log.createdAt,
    })),
  };
}
