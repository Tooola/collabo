import { Request, Response } from 'express';
import { teamService } from '../services/teamService';
import { createTeamSchema, updateTeamSchema } from '../validation/teamSchemas';
import { AuthRequest } from '../middlewares/authenticate';

export const teamController = {
  async getAll(req: Request, res: Response) {
    const teams = await teamService.getAll(req as AuthRequest);
    res.json({ teams });
  },

  async getById(req: Request, res: Response) {
    const team = await teamService.getById(req.params.id, req as AuthRequest);
    if (!team) return res.status(404).json({ error: 'Not Found', message: 'Team not found' });
    res.json({ team });
  },

  async create(req: Request, res: Response) {
    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const team = await teamService.create(parsed.data, req as AuthRequest);
    res.status(201).json({ team });
  },

  async update(req: Request, res: Response) {
    const parsed = updateTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }
    const team = await teamService.update(req.params.id, parsed.data);
    res.json({ team });
  },

  async delete(req: Request, res: Response) {
    await teamService.delete(req.params.id);
    res.json({ success: true });
  },

  async addMember(req: Request, res: Response) {
    const { userId, role } = req.body;
    const member = await teamService.addMember(req.params.id, userId, role);
    res.json({ user: member });
  },

  async removeMember(req: Request, res: Response) {
    await teamService.removeMember(req.params.id, req.params.userId);
    res.json({ success: true });
  },

  async getMembers(req: Request, res: Response) {
    const members = await teamService.getMembers(req.params.id, req as AuthRequest);
    res.json({ members });
  }
};
