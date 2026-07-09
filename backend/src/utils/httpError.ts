export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message = 'Resource not found') => new HttpError(404, message);
export const forbidden = (message = 'Forbidden') => new HttpError(403, message);
export const badRequest = (message = 'Bad request', details?: unknown) => new HttpError(400, message, details);
