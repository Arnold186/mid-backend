import { Router } from 'express';
import { registerSchema } from '../validations/user.validation';
import * as authService from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    const result = await authService.registerUser(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
