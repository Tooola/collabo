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
exports.authService = {
    async login(email, password, requestedRole) {
        const user = await User_1.User.findOne({ email });
        if (!user)
            return null;
        // Validate role
        if (requestedRole) {
            const dbRole = (0, formatters_1.roleFromClient)(requestedRole) ?? 'DEV';
            if (user.role !== dbRole) {
                return { error: 'Accès refusé pour ce rôle' };
            }
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
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
        await (0, mailer_1.sendEmail)(user.email, 'Code de vérification - GestPro', emailHtml);
        return { requireOtp: true };
    },
    async verifyOtp(data) {
        const user = await User_1.User.findOne({ email: data.email });
        if (!user)
            return null;
        if (data.role) {
            const dbRole = (0, formatters_1.roleFromClient)(data.role) ?? 'DEV';
            if (user.role !== dbRole) {
                return { error: 'Accès refusé pour ce rôle' };
            }
        }
        const valid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!valid)
            return null;
        if (user.otpCode !== data.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return { error: 'Code OTP invalide ou expiré' };
        }
        // Clear OTP
        user.otpCode = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, teamId: user.teamId?.toString() || null, workspaceId: user.workspaceId.toString() }, env_1.env.jwtSecret, { expiresIn: '7d' });
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
            teamId: data.teamId || null,
            workspaceId
        });
        return (0, formatters_1.formatUser)(user);
    },
    async me(id) {
        const user = await User_1.User.findById(id);
        return user ? (0, formatters_1.formatUser)(user) : null;
    }
};
