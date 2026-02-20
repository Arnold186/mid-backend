import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import * as reportService from '../services/report.service';

const router = Router();

router.get('/user-activity', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const report = await reportService.getUserActivityReport(userId, limit);
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
