import { User } from '../models/User';
import { Task } from '../models/Task';
import bcrypt from 'bcryptjs';
import { formatUser, roleFromClient } from '../utils/formatters';
export const userService = {
    async getAll() {
        const users = await User.find().sort({ createdAt: 1 });
        return users.map(formatUser);
    },
    async getById(id) {
        const user = await User.findById(id);
        return user ? formatUser(user) : null;
    },
    async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: roleFromClient(data.role) ?? 'DEV',
            teamId: data.teamId || null
        });
        return formatUser(user);
    },
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.role !== undefined)
            updateData.role = roleFromClient(data.role);
        if (data.teamId !== undefined)
            updateData.teamId = data.teamId || null;
        if (data.password !== undefined)
            updateData.password = await bcrypt.hash(data.password, 10);
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        return user ? formatUser(user) : null;
    },
    async delete(id) {
        await Task.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });
        await User.findByIdAndDelete(id);
        return { success: true };
    }
};
