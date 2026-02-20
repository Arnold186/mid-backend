import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as itemService from '../services/item.service';
import * as favoriteService from '../services/favorite.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const result = await itemService.listItems({ cursor, limit });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/favorites', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const favorites = await favoriteService.getFavorites(userId);
    res.status(200).json(favorites);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/favorite', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const itemId = req.params.id;
    const result = await favoriteService.addFavorite(userId, itemId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/favorite', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const itemId = req.params.id;
    const result = await favoriteService.removeFavorite(userId, itemId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
