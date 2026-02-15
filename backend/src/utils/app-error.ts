/**
 * Custom application error class with HTTP status codes.
 * Replaces the hacky `(error as any).statusCode` pattern.
 * 
 * Usage:
 *   throw new AppError('Not found', 404);
 *   throw AppError.unauthorized('Invalid credentials');
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    // Factory methods for common HTTP errors
    static badRequest(message: string = 'Bad request') {
        return new AppError(message, 400);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new AppError(message, 401);
    }

    static forbidden(message: string = 'Forbidden') {
        return new AppError(message, 403);
    }

    static notFound(message: string = 'Resource not found') {
        return new AppError(message, 404);
    }

    static conflict(message: string = 'Conflict') {
        return new AppError(message, 409);
    }

    static tooManyRequests(message: string = 'Too many requests') {
        return new AppError(message, 429);
    }
}
