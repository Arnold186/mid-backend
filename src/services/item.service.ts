import { PrismaClient } from '@prisma/client';
import { getCache, setCache } from '../utils/cache';

const prisma = new PrismaClient();

const CACHE_KEY_PREFIX = 'items:list:';
const CACHE_TTL_MS = 60_000;

export interface CursorInput {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function listItems(opts: CursorInput = {}): Promise<
  PaginatedResult<{ id: string; title: string; description: string | null; createdAt: Date }>
> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  const cacheKey = `${CACHE_KEY_PREFIX}${opts.cursor ?? 'start'}:${limit}`;
  const cached = getCache<PaginatedResult<{ id: string; title: string; description: string | null; createdAt: Date }>>(cacheKey);
  if (cached) return cached;

  const take = limit + 1;
  const cursor = opts.cursor ? { id: opts.cursor } : undefined;

  const items = await prisma.item.findMany({
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor as { id: string } | undefined,
    orderBy: { id: 'asc' },
    select: { id: true, title: true, description: true, createdAt: true },
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

  const result: PaginatedResult<{ id: string; title: string; description: string | null; createdAt: Date }> = {
    data,
    nextCursor,
    hasMore,
  };
  setCache(cacheKey, result, CACHE_TTL_MS);
  return result;
}
