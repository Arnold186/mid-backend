import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import * as notificationService from './notification.service';
import * as activityService from './activity.service';

const prisma = new PrismaClient();

export async function addFavorite(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError(404, 'Item not found');

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });
  if (existing) throw new AppError(409, 'Item already in favorites');

  const fav = await prisma.favorite.create({
    data: { userId, itemId },
    include: { item: true },
  });

  notificationService.addNotification(
    userId,
    'favorite_added',
    `You favorited "${item.title}"`
  );

  await activityService.logActivity(userId, 'favorite_add', {
    itemId,
    itemTitle: item.title,
  });

  return fav;
}

export async function removeFavorite(userId: string, itemId: string) {
  const fav = await prisma.favorite.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });
  if (!fav) throw new AppError(404, 'Favorite not found');

  await prisma.favorite.delete({
    where: { userId_itemId: { userId, itemId } },
  });

  return { message: 'Removed from favorites' };
}

export async function getFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { createdAt: 'desc' },
  });
}
