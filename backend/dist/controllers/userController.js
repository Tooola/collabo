"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
const userSchemas_1 = require("../validation/userSchemas");
exports.userController = {
    async getAll(req, res) {
        const users = await userService_1.userService.getAll(req);
        res.json({ users });
    },
    async getById(req, res) {
        const user = await userService_1.userService.getById(req.params.id);
        if (!user)
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        res.json({ user });
    },
    async create(req, res) {
        const parsed = userSchemas_1.createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await userService_1.userService.create(parsed.data, req);
        res.status(201).json({ user });
    },
    async update(req, res) {
        const parsed = userSchemas_1.updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await userService_1.userService.update(req.params.id, parsed.data);
        res.json({ user });
    },
    async delete(req, res) {
        await userService_1.userService.delete(req.params.id);
        res.json({ success: true });
    }
};
