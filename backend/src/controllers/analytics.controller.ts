import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import logger from '../utils/logger';

const analyticsService = new AnalyticsService();

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const data = await analyticsService.getDashboardMetrics();
        res.status(200).json(data);
    } catch (error: any) {
        logger.error(error.message);
        res.status(500).json({ message: error.message });
    }
};
