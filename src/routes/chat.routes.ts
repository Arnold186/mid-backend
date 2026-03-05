import express from 'express';
import { fetchMessages } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/chat/:room
router.get('/:room', authMiddleware, fetchMessages);

export default router;
