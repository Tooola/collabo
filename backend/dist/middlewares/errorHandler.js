import { HttpError } from '../utils/httpError';
export const errorHandler = (err, _req, res, _next) => {
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
    if (err.code === 11000) {
        return res.status(409).json({ error: 'Conflict', message: 'Duplicate field value entered' });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message || 'Something went wrong' });
};
