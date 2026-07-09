import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { env } from '../config/env';
import { formatUser, roleFromClient } from '../utils/formatters';
import { sendEmail } from '../utils/mailer';

export const authService = {
  async login(email: string, password: string, requestedRole?: string) {
    const user = await User.findOne({ email });
    if (!user) return null;

    // Validate role
    if (requestedRole) {
      const dbRole = roleFromClient(requestedRole) ?? 'DEV';
      if (user.role !== dbRole) {
        return { error: 'Accès refusé pour ce rôle' };
      }
    }

    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) return null;

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    console.log(`\n=========================================\n`);
    console.log(`🔐 OTP pour ${user.email} : ${otpCode}`);
    console.log(`\n=========================================\n`);

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Vérification de connexion - GestPro</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de vérification à usage unique (OTP) :</p>
        <h1 style="background-color: #f4f4f5; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px; color: #4f46e5;">${otpCode}</h1>
        <p>Ce code expirera dans 5 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.</p>
      </div>
    `;
    await sendEmail(user.email, 'Code de vérification - GestPro', emailHtml);

    return { requireOtp: true };
  },

  async verifyOtp(data: { email: string; password: string; role?: string; otp: string }) {
    const user = await User.findOne({ email: data.email });
    if (!user) return null;

    if (data.role) {
      const dbRole = roleFromClient(data.role) ?? 'DEV';
      if (user.role !== dbRole) {
        return { error: 'Accès refusé pour ce rôle' };
      }
    }

    const valid = await bcrypt.compare(data.password, user.password!);
    if (!valid) return null;

    if (user.otpCode !== data.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return { error: 'Code OTP invalide ou expiré' };
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, teamId: user.teamId?.toString() || null, workspaceId: user.workspaceId.toString() },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: formatUser(user),
      token
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) return { error: 'Utilisateur non trouvé' };

    const valid = await bcrypt.compare(currentPassword, user.password!);
    if (!valid) return { error: 'Mot de passe actuel incorrect' };

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { success: true };
  },

  async register(data: { name: string; email: string; password: string; role?: string; teamId?: string; workspaceId?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // If no workspaceId provided, generate a brand-new isolated workspace for this user
    const workspaceId = data.workspaceId ? new mongoose.Types.ObjectId(data.workspaceId) : new mongoose.Types.ObjectId();
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: roleFromClient(data.role) ?? 'DEV',
      teamId: data.teamId || null,
      workspaceId
    });
    return formatUser(user);
  },

  async me(id: string) {
    const user = await User.findById(id);
    return user ? formatUser(user) : null;
  }
};
