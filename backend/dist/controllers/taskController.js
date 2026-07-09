import { taskService } from '../services/taskService';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validation/taskSchemas';
export const taskController = {
    async getAll(req, res) {
        const tasks = await taskService.getAll(req);
        res.json({ tasks });
    },
    async getByProject(req, res) {
        const tasks = await taskService.getByProject(req.params.projectId ?? req.params.id, req);
        res.json({ tasks });
    },
    async getById(req, res) {
        const task = await taskService.getById(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
        res.json({ task });
    },
    async create(req, res) {
        const parsed = createTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService.create(parsed.data, req);
        res.status(201).json({ task });
    },
    async update(req, res) {
        const parsed = updateTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService.update(req.params.id, parsed.data, req);
        res.json({ task });
    },
    async updateStatus(req, res) {
        const parsed = updateTaskStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService.updateStatus(req.params.id, parsed.data.status, req);
        res.json({ task });
    },
    async delete(req, res) {
        await taskService.delete(req.params.id);
        res.json({ success: true });
    }
};
