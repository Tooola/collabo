import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    teams: { teamId: string; role: string }[];
    workspaceId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token required' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as {
      id: string;
      email: string;
      role: string;
      teams: { teamId: string; role: string }[];
      workspaceId: string;
    };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};
