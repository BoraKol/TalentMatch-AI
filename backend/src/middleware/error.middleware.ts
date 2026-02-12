import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { config } from '../config';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
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
