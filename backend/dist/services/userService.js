"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const formatters_1 = require("../utils/formatters");
const mailer_1 = require("../utils/mailer");
const emailTemplates_1 = require("../utils/emailTemplates");
const env_1 = require("../config/env");
exports.userService = {
    async getAll(req) {
        const users = await User_1.User.find({ workspaceId: req.user.workspaceId }).sort({ createdAt: 1 });
        return users.map(formatters_1.formatUser);
    },
    async getById(id) {
        const user = await User_1.User.findById(id);
        return user ? (0, formatters_1.formatUser)(user) : null;
    },
    async create(data, req) {
        // Generate a secure temporary password if none provided
        const tempPassword = data.password || crypto_1.default.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) + '!Gp1';
        const hashedPassword = await bcryptjs_1.default.hash(tempPassword, 10);
        const dbRole = (0, formatters_1.roleFromClient)(data.role) ?? 'DEV';
        const normalizedEmail = data.email.toLowerCase().trim();
        const user = await User_1.User.create({
            name: data.name,
            email: normalizedEmail,
            password: hashedPassword,
            role: dbRole,
            teams: data.teamId ? [{ teamId: data.teamId, role: 'DEV' }] : [],
            workspaceId: req.user.workspaceId
        });
        // Dynamically use the request origin if available, fallback to env.frontendUrl
        const baseUrl = req.headers.origin || env_1.env.frontendUrl;
        // Build role-specific login URL for the email link
        const roleParam = dbRole.toLowerCase();
        const loginUrl = `${baseUrl}/login?role=${roleParam}`;
        // Send welcome email (non-blocking — failure shouldn't break user creation)
        const html = (0, emailTemplates_1.buildWelcomeEmailHtml)({
            userName: data.name,
            userEmail: normalizedEmail,
            tempPassword,
            role: dbRole,
            loginUrl,
        });
        await (0, mailer_1.sendEmail)(normalizedEmail, `Bienvenue sur GestPro — Vos identifiants de connexion`, html)
            .catch(err => console.error('❌ Welcome email failed:', err));
        return (0, formatters_1.formatUser)(user);
    },
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.role !== undefined)
            updateData.role = (0, formatters_1.roleFromClient)(data.role);
        if (data.password !== undefined)
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        // NOTE: team memberships are managed via /teams/:id/members — never overwrite here
        const user = await User_1.User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
        return user ? (0, formatters_1.formatUser)(user) : null;
    },
    async delete(id) {
        await Task_1.Task.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });
        await User_1.User.findByIdAndDelete(id);
        return { success: true };
    }
};
