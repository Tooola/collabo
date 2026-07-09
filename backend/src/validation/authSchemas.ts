import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['admin', 'lead', 'dev', 'ADMIN', 'LEAD', 'DEV']).optional()
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['admin', 'lead', 'dev', 'ADMIN', 'LEAD', 'DEV']).optional(),
  otp: z.string().min(6).max(6)
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'LEAD', 'DEV', 'admin', 'lead', 'dev']).optional(),
  teamId: z.string().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
});

