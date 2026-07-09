import { User } from '../models/User';
import { Task } from '../models/Task';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/authenticate';
import { formatUser, roleFromClient } from '../utils/formatters';

export const userService = {
  async getAll(req: AuthRequest) {
    const users = await User.find({ workspaceId: req.user!.workspaceId }).sort({ createdAt: 1 });
    return users.map(formatUser);
  },

  async getById(id: string) {
    const user = await User.findById(id);
    return user ? formatUser(user) : null;
  },

  async create(data: { name: string; email: string; password: string; role?: string; teamId?: string | null }, req: AuthRequest) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: roleFromClient(data.role) ?? 'DEV',
      teamId: data.teamId || null,
      workspaceId: req.user!.workspaceId
    });
    return formatUser(user);
  },

  async update(id: string, data: { name?: string; email?: string; password?: string; role?: string; teamId?: string | null }) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = roleFromClient(data.role);
    if (data.teamId !== undefined) updateData.teamId = data.teamId || null;
    if (data.password !== undefined) updateData.password = await bcrypt.hash(data.password, 10);

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return user ? formatUser(user) : null;
  },

  async delete(id: string) {
    await Task.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });
    await User.findByIdAndDelete(id);
    return { success: true };
  }
};
