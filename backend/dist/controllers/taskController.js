"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const taskService_1 = require("../services/taskService");
const taskSchemas_1 = require("../validation/taskSchemas");
exports.taskController = {
    async getAll(req, res) {
        const tasks = await taskService_1.taskService.getAll(req);
        res.json({ tasks });
    },
    async getByProject(req, res) {
        const tasks = await taskService_1.taskService.getByProject(req.params.projectId ?? req.params.id, req);
        res.json({ tasks });
    },
    async getById(req, res) {
        const task = await taskService_1.taskService.getById(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
        res.json({ task });
    },
    async create(req, res) {
        const parsed = taskSchemas_1.createTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService_1.taskService.create(parsed.data, req);
        res.status(201).json({ task });
    },
    async update(req, res) {
        const parsed = taskSchemas_1.updateTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService_1.taskService.update(req.params.id, parsed.data, req);
        res.json({ task });
    },
    async updateStatus(req, res) {
        const parsed = taskSchemas_1.updateTaskStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const task = await taskService_1.taskService.updateStatus(req.params.id, parsed.data.status, req);
        res.json({ task });
    },
    async delete(req, res) {
        await taskService_1.taskService.delete(req.params.id);
        res.json({ success: true });
    }
};
