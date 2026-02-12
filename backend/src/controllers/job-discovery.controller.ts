
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { jobDiscoveryService } from '../services/job-discovery.service';

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
            console.error('Job Discovery Error:', error);
            if (error.message.includes('Candidate profile not found')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to discover jobs' });
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
            console.error('Skill Gap Error:', error);
            if (error.message === 'Candidate profile not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to analyze skill gaps' });
        }
    }
}

export const jobDiscoveryController = new JobDiscoveryController();
