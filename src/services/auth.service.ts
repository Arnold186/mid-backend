import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RegisterInput } from '../validations/user.validation';
import { AppError } from '../middleware/errorHandler';
import * as activityService from './activity.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: input.role,
      phoneNumber: input.phoneNumber ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  await activityService.logActivity(user.id, 'register', {
    name: user.name,
    email: user.email,
  });

  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    },
    token,
  };
}
