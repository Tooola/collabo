import { projectService } from '../services/projectService';
import { createProjectSchema, updateProjectSchema } from '../validation/projectSchemas';
export const projectController = {
    async getAll(req, res) {
        const projects = await projectService.getAll(req);
        res.json({ projects });
    },
    async getById(req, res) {
        const project = await projectService.getById(req.params.id);
        if (!project)
            return res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        res.json({ project });
    },
    async create(req, res) {
        const parsed = createProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const project = await projectService.create(parsed.data);
        res.status(201).json({ project });
    },
    async update(req, res) {
        const parsed = updateProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const project = await projectService.update(req.params.id, parsed.data);
        res.json({ project });
    },
    async delete(req, res) {
        await projectService.delete(req.params.id);
        res.json({ success: true });
    }
};
