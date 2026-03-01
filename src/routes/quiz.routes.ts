import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as quizService from '../services/quiz.service';

const router = Router();

// /api/courses/:courseId/quizzes
const questionSchema = z.object({
    text: z.string().min(1, 'Question text required'),
    options: z.array(z.string()).min(2, 'At least 2 options required'),
    answer: z.string().min(1, 'Ans required')
});

const quizSchema = z.object({
    title: z.string().min(1, 'Quiz title required'),
    questions: z.array(questionSchema).min(1, 'At least 1 question required')
});

export const createQuizAndCourseRouter = (app: Router) => {
    const quizRouter = Router({ mergeParams: true });

    quizRouter.post('/', authMiddleware, requireRole(['TEACHER']), async (req, res, next) => {
        try {
            const { courseId } = req.params as { courseId: string };
            const parsed = quizSchema.parse(req.body);
            const quiz = await quizService.createQuiz(courseId, parsed.title, parsed.questions);
            res.status(201).json(quiz);
        } catch (err) {
            next(err);
        }
    });

    quizRouter.get('/', async (req, res, next) => {
        try {
            const { courseId } = req.params as { courseId: string };
            const quizzes = await quizService.getQuizzesForCourse(courseId);
            res.status(200).json(quizzes);
        } catch (err) {
            next(err);
        }
    });

    app.use('/:courseId/quizzes', quizRouter);
};
