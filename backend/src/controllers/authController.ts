import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { loginSchema, registerSchema, verifyOtpSchema, changePasswordSchema } from '../validation/authSchemas';
import { env } from '../config/env';
import { AuthRequest } from '../middlewares/authenticate';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
      }

      const result = await authService.login(parsed.data.email, parsed.data.password, parsed.data.role);
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
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  async verifyOtp(req: Request, res: Response) {
    try {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
      }

      const result = await authService.verifyOtp(parsed.data);
      if (!result) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      if (result.error) {
        return res.status(400).json({ error: 'Bad Request', message: result.error });
      }

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ user: result.user, token: result.token });
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
    }

    const user = await authService.register(parsed.data);
    res.status(201).json({ user });
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  },

  async changePassword(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) return res.status(401).json({ error: 'Unauthorized' });

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation Error', message: parsed.error.errors });
      }

      const result = await authService.changePassword(authReq.user.id, parsed.data.currentPassword, parsed.data.newPassword);
      if (result.error) return res.status(400).json({ error: 'Bad Request', message: result.error });
      res.json({ success: true });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  async me(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const user = authReq.user ? await authService.me(authReq.user.id) : null;
    if (!user) return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
    res.json({ user });
  }
};
