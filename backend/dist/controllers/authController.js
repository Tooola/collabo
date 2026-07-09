import { authService } from '../services/authService';
import { loginSchema, registerSchema } from '../validation/authSchemas';
import { env } from '../config/env';
export const authController = {
    async login(req, res) {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const result = await authService.login(parsed.data.email, parsed.data.password);
        if (!result) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ user: result.user, token: result.token });
    },
    async register(req, res) {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
        }
        const user = await authService.register(parsed.data);
        res.status(201).json({ user });
    },
    async logout(req, res) {
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    },
    async me(req, res) {
        const authReq = req;
        const user = authReq.user ? await authService.me(authReq.user.id) : null;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
        res.json({ user });
    }
};
