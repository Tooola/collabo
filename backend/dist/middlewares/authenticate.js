import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export const authenticate = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Token required' });
    }
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }
};
