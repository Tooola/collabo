"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.registerSchema = exports.verifyOtpSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'lead', 'dev', 'ADMIN', 'LEAD', 'DEV']).optional()
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'lead', 'dev', 'ADMIN', 'LEAD', 'DEV']).optional(),
    otp: zod_1.z.string().min(6).max(6)
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['ADMIN', 'LEAD', 'DEV', 'admin', 'lead', 'dev']).optional(),
    teamId: zod_1.z.string().optional()
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
});
