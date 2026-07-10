import { User } from '../models/User';
import { Task } from '../models/Task';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRequest } from '../middlewares/authenticate';
import { formatUser, roleFromClient } from '../utils/formatters';
import { sendEmail } from '../utils/mailer';
import { buildWelcomeEmailHtml } from '../utils/emailTemplates';
import { env } from '../config/env';

export const userService = {
  async getAll(req: AuthRequest) {
    const users = await User.find({ workspaceId: req.user!.workspaceId }).sort({ createdAt: 1 });
    return users.map(formatUser);
  },

  async getById(id: string) {
    const user = await User.findById(id);
    return user ? formatUser(user) : null;
  },

  async create(data: { name: string; email: string; password?: string; role?: string; teamId?: string | null }, req: AuthRequest) {
    // Generate a secure temporary password if none provided
    const tempPassword = data.password || crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) + '!Gp1';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const dbRole = roleFromClient(data.role) ?? 'DEV';

    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await User.create({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: dbRole,
      teamId: data.teamId || null,
      workspaceId: req.user!.workspaceId
    });

    // Dynamically use the request origin if available, fallback to env.frontendUrl
    const baseUrl = req.headers.origin || env.frontendUrl;
    
    // Build role-specific login URL for the email link
    const roleParam = dbRole.toLowerCase();
    const loginUrl = `${baseUrl}/login?role=${roleParam}`;

    // Send welcome email (non-blocking — failure shouldn't break user creation)
    const html = buildWelcomeEmailHtml({
      userName: data.name,
      userEmail: normalizedEmail,
      tempPassword,
      role: dbRole,
      loginUrl,
    });

    sendEmail(data.email, `Bienvenue sur GestPro — Vos identifiants de connexion`, html)
      .catch(err => console.error('❌ Welcome email failed:', err));

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
