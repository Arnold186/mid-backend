import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$|^[0-9]{10,15}$/,
    'Invalid phone number format. Use E.164 or 10-15 digits'
  )
  .optional()
  .or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional().default('STUDENT'),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$|^[0-9]{10,15}$/,
      'Invalid phone number format. Use E.164 or 10-15 digits'
    )
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
