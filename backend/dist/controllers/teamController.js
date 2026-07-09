import { teamService } from '../services/teamService';
import { createTeamSchema, updateTeamSchema } from '../validation/teamSchemas';
export const teamController = {
    async getAll(req, res) {
        const teams = await teamService.getAll(req);
        res.json({ teams });
    },
    async getById(req, res) {
        const team = await teamService.getById(req.params.id, req);
        if (!team)
            return res.status(404).json({ error: 'Not Found', message: 'Team not found' });
        res.json({ team });
    },
    async create(req, res) {
        const parsed = createTeamSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const team = await teamService.create(parsed.data);
        res.status(201).json({ team });
    },
    async update(req, res) {
        const parsed = updateTeamSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const team = await teamService.update(req.params.id, parsed.data);
        res.json({ team });
    },
    async delete(req, res) {
        await teamService.delete(req.params.id);
        res.json({ success: true });
    },
    async addMember(req, res) {
        const { userId, role } = req.body;
        const member = await teamService.addMember(req.params.id, userId, role);
        res.json({ user: member });
    },
    async removeMember(req, res) {
        await teamService.removeMember(req.params.id, req.params.userId);
        res.json({ success: true });
    },
    async getMembers(req, res) {
        const members = await teamService.getMembers(req.params.id, req);
        res.json({ members });
    }
};
