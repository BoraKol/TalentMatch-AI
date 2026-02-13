
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { referralService } from '../services/referral.service';
import User from '../models/user.model';
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
            const user = req.user;
            let institutionId = undefined;

            if (user?.role === 'institution_admin') {
                const dbUser = await User.findById(user.id);
                if (!dbUser?.institution) return res.status(403).json({ error: 'User not linked to institution' });
                institutionId = dbUser.institution.toString();
            }

            const candidates = await referralService.getCandidatesForReferral(search, institutionId);
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
            const user = req.user;
            let institutionId = undefined;

            if (user?.role === 'institution_admin') {
                const dbUser = await User.findById(user.id);
                if (!dbUser?.institution) return res.status(403).json({ error: 'User not linked to institution' });
                institutionId = dbUser.institution.toString();
            }

            const referrals = await referralService.getAllReferrals(status, institutionId);
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

    async autoMatch(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const user = await User.findById(userId);

            if (!user?.institution && user?.role !== 'super_admin') {
                return res.status(403).json({ error: 'Only institution admins or super admins can trigger auto-match' });
            }

            const institutionId = user?.institution?.toString();
            // Prioritize query param, fallback to user's institution
            const targetInstId = (req.query.institutionId as string) || institutionId;

            // If user has no institution (Super Admin) AND didn't provide one, implies global scan
            if (!targetInstId && user?.role !== 'super_admin') {
                return res.status(400).json({ error: 'No institution associated with your account' });
            }

            // For super_admin, targetInstId can be undefined (implies global scan)
            // autoMatchCandidates now handles optional institutionId
            const recommendations = await referralService.autoMatchCandidates(targetInstId);
            res.json(recommendations);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }
}

export const referralController = new ReferralController();
