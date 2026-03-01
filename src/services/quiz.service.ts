import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export async function createQuiz(courseId: string, title: string, questions: { text: string, options: string[], answer: string }[]) {
    // Verify course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError(404, 'Course not found');

    const quiz = await prisma.quiz.create({
        data: {
            title,
            courseId,
            questions: {
                create: questions.map(q => ({
                    text: q.text,
                    options: JSON.stringify(q.options),
                    answer: q.answer
                }))
            }
        },
        include: { questions: true }
    });

    return quiz;
}

export async function getQuizzesForCourse(courseId: string) {
    return await prisma.quiz.findMany({
        where: { courseId },
        include: { questions: true }
    });
}
