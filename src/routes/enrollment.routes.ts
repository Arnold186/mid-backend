import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as enrollmentService from '../services/enrollment.service';

const router = Router();

// Enroll in a course (STUDENT only)
router.post('/courses/:courseId/enroll', authMiddleware, requireRole(['STUDENT']), async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.enroll(req.user!.userId, req.params.courseId);
        res.status(201).json(enrollment);
    } catch (err) {
        next(err);
    }
});

// List student enrollments
router.get('/enrollments', authMiddleware, requireRole(['STUDENT']), async (req, res, next) => {
    try {
        const enrollments = await enrollmentService.getEnrollments(req.user!.userId);
        res.status(200).json(enrollments);
    } catch (err) {
        next(err);
    }
});

export default router;
