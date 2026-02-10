import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { applicationService } from '../services/application.service';
import { aiMatchingService } from '../services/ai-matching.service';
import Candidate from '../models/candidate.model';

export class ApplicationController {

    // Apply for a job
    async apply(req: AuthRequest, res: Response) {
        try {
            const { jobId, aiMatchScore } = req.body;
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            // Find candidate by user ID
            const candidate = await Candidate.findOne({ user: userId });
            if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required' });
            }

            const application = await applicationService.applyForJob(
                candidate._id.toString(), jobId, aiMatchScore
            );
            res.status(201).json(application);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get candidate's applications with full job details
    async getMyApplications(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const candidate = await Candidate.findOne({ user: userId });
            if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

            const applications = await applicationService.getCandidateApplications(
                candidate._id.toString()
            );
            res.json(applications);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get AI Matched Jobs for Candidate
    async getRecommendedJobs(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const candidate = await Candidate.findOne({ user: userId });
            if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

            const matches = await aiMatchingService.findTopJobsForCandidate(
                candidate._id.toString()
            );
            res.json(matches);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const applicationController = new ApplicationController();
