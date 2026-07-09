import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../validation/userSchemas';
import { AuthRequest } from '../middlewares/authenticate';

export const userController = {
  async getAll(req: Request, res: Response) {
    const users = await userService.getAll(req as AuthRequest);
    res.json({ users });
  },

  async getById(req: Request, res: Response) {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    res.json({ user });
  },

  async create(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const user = await userService.create(parsed.data, req as AuthRequest);
    res.status(201).json({ user });
  },

  async update(req: Request, res: Response) {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const user = await userService.update(req.params.id, parsed.data);
    res.json({ user });
  },

  async delete(req: Request, res: Response) {
    await userService.delete(req.params.id);
    res.json({ success: true });
  }
};