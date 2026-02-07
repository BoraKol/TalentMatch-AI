import { Request, Response } from 'express';
import { aiMatchingService } from '../services/ai-matching.service';
import Job from '../models/job.model';

export class EmployerController {

    // Get AI Matches for a specific Job
    async getJobMatches(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const { forceRefresh } = req.body; // Optional force refresh

            // Verify Job belongs to Employer (security check)
            // @ts-ignore
            const userId = req.user.id;
            const job = await Job.findOne({ _id: jobId, postedBy: userId });

            if (!job) {
                return res.status(404).json({ error: 'Job not found or unauthorized' });
            }

            const matches = await aiMatchingService.findTopCandidates(jobId, forceRefresh);
            res.json(matches);
        } catch (error: any) {
            console.error('Get Job Matches Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export const employerController = new EmployerController();
