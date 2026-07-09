import { Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validation/taskSchemas';
import { AuthRequest } from '../middlewares/authenticate';

export const taskController = {
  async getAll(req: Request, res: Response) {
    const tasks = await taskService.getAll(req as AuthRequest);
    res.json({ tasks });
  },

  async getByProject(req: Request, res: Response) {
    const tasks = await taskService.getByProject(req.params.projectId ?? req.params.id, req as AuthRequest);
    res.json({ tasks });
  },

  async getById(req: Request, res: Response) {
    const task = await taskService.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    res.json({ task });
  },

  async create(req: Request, res: Response) {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const task = await taskService.create(parsed.data, req as AuthRequest);
    res.status(201).json({ task });
  },

  async update(req: Request, res: Response) {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const task = await taskService.update(req.params.id, parsed.data, req as AuthRequest);
    res.json({ task });
  },

  async updateStatus(req: Request, res: Response) {
    const parsed = updateTaskStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const task = await taskService.updateStatus(req.params.id, parsed.data.status, req as AuthRequest);
    res.json({ task });
  },

  async delete(req: Request, res: Response) {
    await taskService.delete(req.params.id);
    res.json({ success: true });
  }
};
