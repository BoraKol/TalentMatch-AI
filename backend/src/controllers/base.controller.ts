import { Request, Response } from 'express';
import { BaseService } from '../services/base.service';
import { Document } from 'mongoose';

export class BaseController<T extends Document> {
    constructor(private service: BaseService<T>) { }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.service.create(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const results = await this.service.findAll(req.query as any);
            res.status(200).json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.service.findById(req.params.id);
            if (!result) {
                res.status(404).json({ message: 'Resource not found' });
                return;
            }
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.service.update(req.params.id, req.body);
            if (!result) {
                res.status(404).json({ message: 'Resource not found' });
                return;
            }
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.service.delete(req.params.id);
            if (!result) {
                res.status(404).json({ message: 'Resource not found' });
                return;
            }
            res.status(200).json({ message: 'Resource deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };
}
