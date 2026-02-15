import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { AppError } from '../utils/app-error';
import { config } from '../config';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Zod validation errors — centralized handling
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.errors
        });
    }

    // AppError — operational errors with proper status codes
    if (err instanceof AppError) {
        logger.warn(`${err.statusCode} ${err.message} [${req.method} ${req.path}]`);
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    // Unknown / unexpected errors
    logger.error(`${err.name}: ${err.message}\n${err.stack}`);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: config.env === 'production' && statusCode === 500
            ? 'Internal server error'
            : message,
        stack: config.env === 'development' ? err.stack : undefined
    });
};

