
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { jobDiscoveryService } from '../services/job-discovery.service';
import { AppError } from '../utils/app-error';

export class JobDiscoveryController {

    /**
     * GET /discover
     * Returns all active jobs scored against the candidate's profile.
     * Flags "Hidden Gems" — jobs where skills match well but title/industry differs.
     */
    async discoverJobs(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const result = await jobDiscoveryService.discoverJobs(userId, req.query);
            res.json(result);
        } catch (error: any) {
            const status = error instanceof AppError ? error.statusCode : 500;
            res.status(status).json({ error: error.message || 'Failed to discover jobs' });
        }
    }

    /**
     * GET /skill-gaps
     * Analyzes candidate skills vs trending job requirements.
     * Returns skills to learn and their potential job impact.
     */
    async getSkillGaps(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const result = await jobDiscoveryService.getSkillGaps(userId);
            res.json(result);
        } catch (error: any) {
            const status = error instanceof AppError ? error.statusCode : 500;
            res.status(status).json({ error: error.message || 'Failed to analyze skill gaps' });
        }
    }
}

export const jobDiscoveryController = new JobDiscoveryController();

