import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export async function createQuiz(
  courseId: string,
  title: string,
  questions: { text: string; options: string[]; answer: string }[]
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(404, 'Course not found');

  const quiz = await prisma.quiz.create({
    data: {
      title,
      courseId,
      status: 'PENDING',
      questions: {
        create: questions.map((q) => ({
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

export async function approveQuiz(quizId: string, status: 'APPROVED' | 'REJECTED') {
  return prisma.quiz.update({
    where: { id: quizId },
    data: { status },
    include: {
      course: {
        select: { id: true, title: true, teacherId: true }
      }
    }
  });
}

export async function listPendingQuizzes() {
  return prisma.quiz.findMany({
    where: { status: 'PENDING' },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacher: { select: { id: true, name: true } }
        }
      },
      _count: { select: { questions: true, attempts: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getApprovedQuizzesForCourse(courseId: string) {
  const quizzes = await prisma.quiz.findMany({
    where: { courseId, status: 'APPROVED' },
    include: { questions: true },
    orderBy: { createdAt: 'asc' }
  });

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    createdAt: q.createdAt,
    questions: q.questions.map((qq) => ({
      id: qq.id,
      text: qq.text,
      options: JSON.parse(qq.options) as string[]
    }))
  }));
}

export async function submitQuizAttempt(
  studentId: string,
  quizId: string,
  answers: Record<string, string>
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true, course: true }
  });
  if (!quiz) throw new AppError(404, 'Quiz not found');
  if (quiz.status !== 'APPROVED') throw new AppError(400, 'Quiz is not published');
  if (quiz.course.status !== 'APPROVED') throw new AppError(400, 'Course is not published');

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: quiz.courseId } }
  });
  if (!enrollment) {
    throw new AppError(403, 'You must be enrolled in this course to take the quiz');
  }

  let score = 0;
  const total = quiz.questions.length;

  for (const q of quiz.questions) {
    const selected = answers[q.id];
    if (selected && selected === q.answer) {
      score += 1;
    }
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId,
      score,
      total,
      answers: JSON.stringify(answers)
    }
  });

  return { attemptId: attempt.id, score, total };
}
