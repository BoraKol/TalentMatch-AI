import { Request, Response } from 'express';
import { applicationService } from '../services/application.service';
import { aiMatchingService } from '../services/ai-matching.service';

export class ApplicationController {

    // Apply for a job
    async apply(req: Request, res: Response) {
        try {
            const { jobId, aiMatchScore } = req.body;
            // Assuming auth middleware adds user to req
            // @ts-ignore
            const candidateId = req.user.id;

            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required' });
            }

            const application = await applicationService.applyForJob(candidateId, jobId, aiMatchScore);
            res.status(201).json(application);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get candidate's applications
    async getMyApplications(req: Request, res: Response) {
        try {
            // @ts-ignore
            const candidateId = req.user.id;
            const applications = await applicationService.getCandidateApplications(candidateId);
            res.json(applications);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get AI Matched Jobs for Candidate
    async getRecommendedJobs(req: Request, res: Response) {
        try {
            // @ts-ignore
            const candidateId = req.user.id;
            const matches = await aiMatchingService.findTopJobsForCandidate(candidateId);
            res.json(matches);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const applicationController = new ApplicationController();
