import { z } from 'zod';
export const createProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['active', 'on_hold', 'completed', 'EN_COURS', 'TERMINE', 'SUSPENDU']).default('active'),
    teamId: z.string()
});
export const updateProjectSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'on_hold', 'completed', 'EN_COURS', 'TERMINE', 'SUSPENDU']).optional(),
    teamId: z.string().optional()
});
