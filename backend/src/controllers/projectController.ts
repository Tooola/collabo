import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { createProjectSchema, updateProjectSchema } from '../validation/projectSchemas';
import { AuthRequest } from '../middlewares/authenticate';

export const projectController = {
  async getAll(req: Request, res: Response) {
    const projects = await projectService.getAll(req as AuthRequest);
    res.json({ projects });
  },

  async getById(req: Request, res: Response) {
    const project = await projectService.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    res.json({ project });
  },

  async create(req: Request, res: Response) {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const project = await projectService.create(parsed.data, req as AuthRequest);
    res.status(201).json({ project });
  },

  async update(req: Request, res: Response) {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const project = await projectService.update(req.params.id, parsed.data);
    res.json({ project });
  },

  async delete(req: Request, res: Response) {
    await projectService.delete(req.params.id);
    res.json({ success: true });
  }
};