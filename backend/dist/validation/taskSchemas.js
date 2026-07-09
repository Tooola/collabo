import { z } from 'zod';
export const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string(),
    assignedTo: z.string().optional(),
    assignedToUserId: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE']).default('To Do')
});
export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    projectId: z.string().optional(),
    assignedTo: z.string().optional(),
    assignedToUserId: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE']).optional()
});
export const updateTaskStatusSchema = z.object({
    status: z.enum(['To Do', 'In Progress', 'Blocked', 'Done', 'A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE'])
});
