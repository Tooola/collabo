"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequest = exports.forbidden = exports.notFound = exports.HttpError = void 0;
class HttpError extends Error {
    status;
    details;
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
exports.HttpError = HttpError;
const notFound = (message = 'Resource not found') => new HttpError(404, message);
exports.notFound = notFound;
const forbidden = (message = 'Forbidden') => new HttpError(403, message);
exports.forbidden = forbidden;
const badRequest = (message = 'Bad request', details) => new HttpError(400, message, details);
exports.badRequest = badRequest;
