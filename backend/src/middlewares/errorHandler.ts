import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.status >= 500 ? 'Internal Server Error' : 'Request Error',
      message: err.message,
      details: err.details
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid ID format' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Bad Request', message: err.message });
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    return res.status(409).json({ error: 'Conflict', message: 'Cet email est déjà utilisé' });
  }

  return res.status(500).json({ error: 'Internal Server Error', message: err.message || 'Something went wrong' });
};
