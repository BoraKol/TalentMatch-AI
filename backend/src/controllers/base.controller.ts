import { Request, Response } from 'express';
import { BaseService } from '../services/base.service';
import { Document } from 'mongoose';
import logger from '../utils/logger';

export class BaseController<T extends Document = any> {
    constructor(protected service?: BaseService<T>) { }

    protected sendSuccess(res: Response, data?: any, message: string = 'Success', statusCode: number = 200): void {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    protected sendError(res: Response, message: string = 'Internal server error', statusCode: number = 500): void {
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.service) throw new Error('Service not defined');
            const result = await this.service.create(req.body);
            this.sendSuccess(res, result, 'Resource created successfully', 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.service) throw new Error('Service not defined');
            const results = await this.service.findAll(req.query as any);
            this.sendSuccess(res, results);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.service) throw new Error('Service not defined');
            const result = await this.service.findById(req.params.id);
            if (!result) {
                this.sendError(res, 'Resource not found', 404);
                return;
            }
            this.sendSuccess(res, result);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.service) throw new Error('Service not defined');
            const result = await this.service.update(req.params.id, req.body);
            if (!result) {
                this.sendError(res, 'Resource not found', 404);
                return;
            }
            this.sendSuccess(res, result, 'Resource updated successfully');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.service) throw new Error('Service not defined');
            const result = await this.service.delete(req.params.id);
            if (!result) {
                this.sendError(res, 'Resource not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Resource deleted successfully');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    };
}

