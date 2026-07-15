import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { env } from '../config/env';
import { formatUser, roleFromClient } from '../utils/formatters';
import { sendEmail } from '../utils/mailer';
import { buildOtpEmailHtml } from '../utils/emailTemplates';

export const authService = {
  async login(email: string, password: string, requestedRole?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return null;

    // Validate role
    if (requestedRole) {
      const dbRole = roleFromClient(requestedRole) ?? 'DEV';
      if (user.role !== dbRole) {
        return { error: 'Accès refusé pour ce rôle' };
      }
    }

    const valid = await bcrypt.compare(normalizedPassword, user.password!);
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
    const emailHtml = buildOtpEmailHtml(otpCode);
    await sendEmail(user.email, 'Code de vérification - GestPro', emailHtml);

    return { requireOtp: true };
  },

  async verifyOtp(data: { email: string; password: string; role?: string; otp: string }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPassword = data.password.trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return null;

    if (data.role) {
      const dbRole = roleFromClient(data.role) ?? 'DEV';
      if (user.role !== dbRole) {
        return { error: 'Accès refusé pour ce rôle' };
      }
    }

    const valid = await bcrypt.compare(normalizedPassword, user.password!);
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
  },

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return { success: true }; // Always return success for security (prevent email enumeration)

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    console.log(`\n=========================================\n`);
    console.log(`🔄 CODE DE RÉINITIALISATION pour ${user.email} : ${resetCode}`);
    console.log(`\n=========================================\n`);

    // Send the email
    const emailHtml = buildOtpEmailHtml(resetCode);
    await sendEmail(user.email, 'Code de réinitialisation - GestPro', emailHtml);

    return { success: true };
  },

  async resetPassword(data: { email: string; token: string; newPassword: string }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return { error: 'Code invalide ou expiré' };
    }

    if (user.resetPasswordToken !== data.token || user.resetPasswordExpires < new Date()) {
      return { error: 'Code invalide ou expiré' };
    }

    // Reset password
    user.password = await bcrypt.hash(data.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true };
  }
};
