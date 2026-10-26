"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const formatters_1 = require("../utils/formatters");
const mailer_1 = require("../utils/mailer");
const emailTemplates_1 = require("../utils/emailTemplates");
exports.authService = {
    async login(email, password, requestedRole) {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPassword = password.trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user)
            return null;
        // Validate role: strictly use base user.role
        if (requestedRole) {
            const dbRole = (0, formatters_1.roleFromClient)(requestedRole) ?? 'DEV';
            if (user.role !== dbRole) {
                return { error: 'Accès refusé pour ce rôle' };
            }
        }
        const valid = await bcryptjs_1.default.compare(normalizedPassword, user.password);
        if (!valid)
            return null;
        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();
        console.log(`\n=========================================\n`);
        console.log(`🔐 OTP pour ${user.email} : ${otpCode}`);
        console.log(`\n=========================================\n`);
        // Send email
        const emailHtml = (0, emailTemplates_1.buildOtpEmailHtml)(otpCode);
        await (0, mailer_1.sendEmail)(user.email, 'Code de vérification - GestPro', emailHtml);
        return { requireOtp: true };
    },
    async verifyOtp(data) {
        const normalizedEmail = data.email.toLowerCase().trim();
        const normalizedPassword = data.password.trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user)
            return null;
        if (data.role) {
            const dbRole = (0, formatters_1.roleFromClient)(data.role) ?? 'DEV';
            if (user.role !== dbRole) {
                return { error: 'Accès refusé pour ce rôle' };
            }
        }
        const valid = await bcryptjs_1.default.compare(normalizedPassword, user.password);
        if (!valid)
            return null;
        if (user.otpCode !== data.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return { error: 'Code OTP invalide ou expiré' };
        }
        // Clear OTP
        user.otpCode = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            teams: user.teams.map((t) => ({ teamId: t.teamId.toString(), role: t.role })),
            workspaceId: user.workspaceId.toString()
        }, env_1.env.jwtSecret, { expiresIn: '7d' });
        return {
            user: (0, formatters_1.formatUser)(user),
            token
        };
    },
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User_1.User.findById(userId);
        if (!user)
            return { error: 'Utilisateur non trouvé' };
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid)
            return { error: 'Mot de passe actuel incorrect' };
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        return { success: true };
    },
    async register(data) {
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // If no workspaceId provided, generate a brand-new isolated workspace for this user
        const workspaceId = data.workspaceId ? new mongoose_1.default.Types.ObjectId(data.workspaceId) : new mongoose_1.default.Types.ObjectId();
        const user = await User_1.User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: (0, formatters_1.roleFromClient)(data.role) ?? 'DEV',
            teams: data.teamId ? [{ teamId: data.teamId, role: 'DEV' }] : [],
            workspaceId
        });
        return (0, formatters_1.formatUser)(user);
    },
    async me(id) {
        const user = await User_1.User.findById(id);
        return user ? (0, formatters_1.formatUser)(user) : null;
    },
    async refreshToken(id) {
        const user = await User_1.User.findById(id);
        if (!user)
            return null;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            teams: user.teams.map((t) => ({ teamId: t.teamId.toString(), role: t.role })),
            workspaceId: user.workspaceId.toString()
        }, env_1.env.jwtSecret, { expiresIn: '7d' });
        return { user: (0, formatters_1.formatUser)(user), token };
    },
    async forgotPassword(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user)
            return { success: true }; // Always return success for security (prevent email enumeration)
        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = resetCode;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        console.log(`\n=========================================\n`);
        console.log(`🔄 CODE DE RÉINITIALISATION pour ${user.email} : ${resetCode}`);
        console.log(`\n=========================================\n`);
        // Send the email
        const emailHtml = (0, emailTemplates_1.buildOtpEmailHtml)(resetCode);
        await (0, mailer_1.sendEmail)(user.email, 'Code de réinitialisation - GestPro', emailHtml);
        return { success: true };
    },
    async resetPassword(data) {
        const normalizedEmail = data.email.toLowerCase().trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            return { error: 'Code invalide ou expiré' };
        }
        if (user.resetPasswordToken !== data.token || user.resetPasswordExpires < new Date()) {
            return { error: 'Code invalide ou expiré' };
        }
        // Reset password
        user.password = await bcryptjs_1.default.hash(data.newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return { success: true };
    }
};
