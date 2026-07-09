import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});