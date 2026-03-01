import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { io } from '../index';
import * as activityService from './activity.service';

const prisma = new PrismaClient();

export async function enroll(studentId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError(404, 'Course not found');
    if (course.status !== 'APPROVED') throw new AppError(400, 'Cannot enroll in unapproved course');

    const enrollment = await prisma.enrollment.create({
        data: {
            studentId,
            courseId
        }
    }).catch((e) => {
        // Unique constraint violation check
        if (e.code === 'P2002') throw new AppError(400, 'Already enrolled in this course');
        throw e;
    });

    await activityService.logActivity(studentId, 'enroll_course', { courseId });

    // Notify teacher
    io.emit(`notification_user_${course.teacherId}`, {
        type: 'NEW_ENROLLMENT',
        message: `A new student enrolled in your course: ${course.title}`,
        courseId
    });

    return enrollment;
}

export async function getEnrollments(studentId: string) {
    return await prisma.enrollment.findMany({
        where: { studentId },
        include: { course: true }
    });
}
