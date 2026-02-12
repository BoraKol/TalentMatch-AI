
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { referralService } from '../services/referral.service';
import { ZodError } from 'zod';

class ReferralController {

    private handleError(res: Response, error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: 'Validation Error', details: error.errors });
        }
        res.status(500).json({ error: error.message });
    }

    // Super Admin: Get all candidates for referral selection
    async getCandidatesForReferral(req: AuthRequest, res: Response) {
        try {
            const search = req.query.search as string;
            const candidates = await referralService.getCandidatesForReferral(search);
            res.json(candidates);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    // Super Admin: Get AI-matched jobs for a specific candidate
    async getMatchesForCandidate(req: AuthRequest, res: Response) {
        try {
            const { candidateId } = req.params;
            const result = await referralService.getMatchesForCandidate(candidateId);
            res.json(result);
        } catch (error: any) {
            if (error.message === 'Candidate not found') {
                return res.status(404).json({ error: error.message });
            }
            this.handleError(res, error);
        }
    }

    // Super Admin: Create a referral (refer candidate to job)
    async createReferral(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const referral = await referralService.createReferral(userId, req.body);
            res.status(201).json(referral);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            if (error.code === 11000 || error.message.includes('already been referred')) {
                return res.status(409).json({ error: 'This candidate has already been referred to this job' });
            }
            if (error.message === 'Candidate not found' || error.message === 'Job not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Get all referrals with filters
    async getAllReferrals(req: AuthRequest, res: Response) {
        try {
            const status = req.query.status as string;
            const referrals = await referralService.getAllReferrals(status);
            res.json(referrals);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    // Candidate: Get my referrals
    async getMyReferrals(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const referrals = await referralService.getMyReferrals(userId);
            res.json(referrals);
        } catch (error: any) {
            if (error.message === 'Candidate profile not found') {
                return res.status(404).json({ error: error.message });
            }
            this.handleError(res, error);
        }
    }

    // Candidate: Respond to referral (accept/decline)
    async respondToReferral(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { referralId } = req.params;
            const { action, message } = req.body;

            const referral = await referralService.respondToReferral(userId, referralId, action, message);
            res.json(referral);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            if (error.message === 'Referral not found or already responded') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Update referral status in pipeline
    async updateReferralStatus(req: AuthRequest, res: Response) {
        try {
            const { referralId } = req.params;
            const { status, notes } = req.body;

            const referral = await referralService.updateReferralStatus(referralId, status, notes);
            res.json(referral);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            if (error.message.includes('Status must be one of')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message === 'Referral not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

export const referralController = new ReferralController();
