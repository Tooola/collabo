"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = void 0;
const teamService_1 = require("../services/teamService");
const teamSchemas_1 = require("../validation/teamSchemas");
exports.teamController = {
    async getAll(req, res) {
        const teams = await teamService_1.teamService.getAll(req);
        res.json({ teams });
    },
    async getById(req, res) {
        const team = await teamService_1.teamService.getById(req.params.id, req);
        if (!team)
            return res.status(404).json({ error: 'Not Found', message: 'Team not found' });
        res.json({ team });
    },
    async create(req, res) {
        const parsed = teamSchemas_1.createTeamSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const team = await teamService_1.teamService.create(parsed.data, req);
        res.status(201).json({ team });
    },
    async update(req, res) {
        const parsed = teamSchemas_1.updateTeamSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const team = await teamService_1.teamService.update(req.params.id, parsed.data);
        res.json({ team });
    },
    async delete(req, res) {
        await teamService_1.teamService.delete(req.params.id);
        res.json({ success: true });
    },
    async addMember(req, res) {
        const { userId, role } = req.body;
        const member = await teamService_1.teamService.addMember(req.params.id, userId, role);
        res.json({ user: member });
    },
    async removeMember(req, res) {
        await teamService_1.teamService.removeMember(req.params.id, req.params.userId);
        res.json({ success: true });
    },
    async getMembers(req, res) {
        const members = await teamService_1.teamService.getMembers(req.params.id, req);
        res.json({ members });
    }
};
