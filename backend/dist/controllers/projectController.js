"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const projectService_1 = require("../services/projectService");
const projectSchemas_1 = require("../validation/projectSchemas");
exports.projectController = {
    async getAll(req, res) {
        const projects = await projectService_1.projectService.getAll(req);
        res.json({ projects });
    },
    async getById(req, res) {
        const project = await projectService_1.projectService.getById(req.params.id);
        if (!project)
            return res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        res.json({ project });
    },
    async create(req, res) {
        const parsed = projectSchemas_1.createProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const project = await projectService_1.projectService.create(parsed.data, req);
        res.status(201).json({ project });
    },
    async update(req, res) {
        const parsed = projectSchemas_1.updateProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const project = await projectService_1.projectService.update(req.params.id, parsed.data);
        res.json({ project });
    },
    async delete(req, res) {
        await projectService_1.projectService.delete(req.params.id);
        res.json({ success: true });
    }
};
