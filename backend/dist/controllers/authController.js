"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const authSchemas_1 = require("../validation/authSchemas");
const env_1 = require("../config/env");
exports.authController = {
    async login(req, res) {
        try {
            const parsed = authSchemas_1.loginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
            }
            const result = await authService_1.authService.login(parsed.data.email, parsed.data.password, parsed.data.role);
            if (!result) {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
            }
            if (result.error) {
                return res.status(403).json({ error: 'Forbidden', message: result.error });
            }
            if (result.requireOtp) {
                return res.json({ requireOtp: true });
            }
            res.status(500).json({ error: 'Internal Server Error', message: 'Unexpected login state' });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    },
    async verifyOtp(req, res) {
        try {
            const parsed = authSchemas_1.verifyOtpSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
            }
            const result = await authService_1.authService.verifyOtp(parsed.data);
            if (!result) {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
            }
            if (result.error) {
                return res.status(400).json({ error: 'Bad Request', message: result.error });
            }
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: env_1.env.nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({ user: result.user, token: result.token });
        }
        catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    },
    async register(req, res) {
        const parsed = authSchemas_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await authService_1.authService.register(parsed.data);
        res.status(201).json({ user });
    },
    async logout(req, res) {
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    },
    async changePassword(req, res) {
        try {
            const authReq = req;
            if (!authReq.user)
                return res.status(401).json({ error: 'Unauthorized' });
            const parsed = authSchemas_1.changePasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
            }
            const result = await authService_1.authService.changePassword(authReq.user.id, parsed.data.currentPassword, parsed.data.newPassword);
            if (result.error)
                return res.status(400).json({ error: 'Bad Request', message: result.error });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    },
    async me(req, res) {
        const authReq = req;
        const user = authReq.user ? await authService_1.authService.me(authReq.user.id) : null;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
        res.json({ user });
    }
};
