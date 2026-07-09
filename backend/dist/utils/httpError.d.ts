export declare class HttpError extends Error {
    status: number;
    details?: unknown;
    constructor(status: number, message: string, details?: unknown);
}
export declare const notFound: (message?: string) => HttpError;
export declare const forbidden: (message?: string) => HttpError;
export declare const badRequest: (message?: string, details?: unknown) => HttpError;
//# sourceMappingURL=httpError.d.ts.map