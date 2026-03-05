import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as courseService from '../services/course.service';

const router = Router();

const courseSchema = z.object({
    title: z.string().min(3, 'Title is too short'),
    description: z.string().optional()
});

// Create course (TEACHER only)
router.post('/', authMiddleware, requireRole(['TEACHER']), async (req, res, next) => {
    try {
        const parsed = courseSchema.parse(req.body);
        const course = await courseService.createCourse(req.user!.userId, parsed.title, parsed.description);
        res.status(201).json(course);
    } catch (err) {
        next(err);
    }
});

// Approve course (ADMIN only)
router.put('/:id/approve', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
    try {
        const { status } = req.body; // Expects 'APPROVED' or 'REJECTED'
        if (status !== 'APPROVED' && status !== 'REJECTED') {
            return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
        }
        const course = await courseService.approveCourse(req.user!.userId, req.params.id, status);
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
});

// List approved courses (Public/Student)
router.get('/', async (req, res, next) => {
    try {
        const courses = await courseService.listApprovedCourses();
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});

// List teacher's courses (TEACHER only)
router.get('/mine', authMiddleware, requireRole(['TEACHER']), async (req, res, next) => {
    try {
        const courses = await courseService.listTeacherCourses(req.user!.userId);
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});

// List pending courses (ADMIN only)
router.get('/pending', authMiddleware, requireRole(['ADMIN']), async (req, res, next) => {
    try {
        const courses = await courseService.listCourses('PENDING');
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
});

// Get single course (Public for approved, restricted otherwise)
router.get('/:id', async (req, res, next) => {
    try {
        const course = await courseService.getCourse(req.params.id);
        if (course.status !== 'APPROVED') {
            return res.status(403).json({ error: 'Course is not published' });
        }
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
});

export default router;
