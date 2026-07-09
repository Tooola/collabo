import { z } from 'zod';
export const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'LEAD', 'DEV', 'admin', 'lead', 'dev']),
    teamId: z.string().nullable().optional()
});
export const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'LEAD', 'DEV', 'admin', 'lead', 'dev']).optional(),
    teamId: z.string().nullable().optional()
});
