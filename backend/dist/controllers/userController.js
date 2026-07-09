import { userService } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../validation/userSchemas';
export const userController = {
    async getAll(req, res) {
        const users = await userService.getAll();
        res.json({ users });
    },
    async getById(req, res) {
        const user = await userService.getById(req.params.id);
        if (!user)
            return res.status(404).json({ error: 'Not Found', message: 'User not found' });
        res.json({ user });
    },
    async create(req, res) {
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await userService.create(parsed.data);
        res.status(201).json({ user });
    },
    async update(req, res) {
        const parsed = updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await userService.update(req.params.id, parsed.data);
        res.json({ user });
    },
    async delete(req, res) {
        await userService.delete(req.params.id);
        res.json({ success: true });
    }
};
