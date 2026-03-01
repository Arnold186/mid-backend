import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import * as activityService from './activity.service';
import { io } from '../index';

const prisma = new PrismaClient();

export async function createCourse(teacherId: string, title: string, description?: string) {
    const course = await prisma.course.create({
        data: {
            title,
            description,
            teacherId,
        },
    });

    await activityService.logActivity(teacherId, 'create_course', { courseId: course.id });

    // Notify admins
    io.emit('notification_admin', {
        type: 'COURSE_PENDING',
        message: `New course pending approval: ${course.title}`,
        courseId: course.id
    });

    return course;
}

export async function approveCourse(adminId: string, courseId: string, status: 'APPROVED' | 'REJECTED') {
    const course = await prisma.course.update({
        where: { id: courseId },
        data: { status }
    });

    await activityService.logActivity(adminId, 'review_course', { courseId, status });

    // Notify teacher
    io.emit(`notification_user_${course.teacherId}`, {
        type: `COURSE_${status}`,
        message: `Your course ${course.title} was ${status.toLowerCase()}`,
        courseId: course.id
    });

    return course;
}

export async function listCourses(status?: string) {
    return await prisma.course.findMany({
        where: status ? { status } : undefined,
        include: {
            teacher: { select: { id: true, name: true } },
            _count: { select: { enrollments: true, quizzes: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getCourse(courseId: string) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            teacher: { select: { id: true, name: true } },
            quizzes: true,
            enrollments: true
        }
    });

    if (!course) throw new AppError(404, 'Course not found');
    return course;
}
