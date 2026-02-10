import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { Referral } from '../models/referral.model';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';
import { aiMatchingService } from '../services/ai-matching.service';

class ReferralController {

    // Super Admin: Get all candidates for referral selection
    async getCandidatesForReferral(req: AuthRequest, res: Response) {
        try {
            const search = req.query.search as string;
            const query: any = {};
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { currentTitle: { $regex: search, $options: 'i' } },
                    { skills: { $elemMatch: { $regex: search, $options: 'i' } } }
                ];
            }

            const candidates = await Candidate.find(query)
                .populate('user', 'email')
                .sort({ createdAt: -1 })
                .lean();

            const formatted = candidates.map((c: any) => ({
                _id: c._id,
                name: `${c.firstName} ${c.lastName}`,
                email: (c.user as any)?.email || '',
                title: c.currentTitle || 'Open to Work',
                skills: c.skills || [],
                experience: c.experience || 0,
                school: c.school || '',
                department: c.department || ''
            }));

            res.json(formatted);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Get AI-matched jobs for a specific candidate
    async getMatchesForCandidate(req: AuthRequest, res: Response) {
        try {
            const { candidateId } = req.params;
            const candidate = await Candidate.findById(candidateId);
            if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

            // Use existing AI matching service
            const matches = await aiMatchingService.findTopJobsForCandidate(candidateId);

            // Check which jobs are already referred
            const existingReferrals = await Referral.find({ candidate: candidateId })
                .select('job status')
                .lean();
            const referredJobMap = new Map(
                existingReferrals.map(r => [r.job.toString(), r.status])
            );

            const enriched = matches.map(m => ({
                ...m,
                referralStatus: referredJobMap.get(m.id) || null,
                isReferred: referredJobMap.has(m.id)
            }));

            res.json({
                candidate: {
                    _id: candidate._id,
                    name: `${candidate.firstName} ${candidate.lastName}`,
                    title: candidate.currentTitle,
                    skills: candidate.skills
                },
                matches: enriched
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Create a referral (refer candidate to job)
    async createReferral(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { candidateId, jobId, aiMatchScore, aiAnalysis, notes } = req.body;
            if (!candidateId || !jobId) {
                return res.status(400).json({ error: 'Candidate ID and Job ID are required' });
            }

            // Verify candidate and job exist
            const [candidate, job] = await Promise.all([
                Candidate.findById(candidateId),
                Job.findById(jobId)
            ]);
            if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
            if (!job) return res.status(404).json({ error: 'Job not found' });

            // Check for duplicate
            const existing = await Referral.findOne({ candidate: candidateId, job: jobId });
            if (existing) {
                return res.status(409).json({ error: 'This candidate has already been referred to this job' });
            }

            const referral = await Referral.create({
                candidate: candidateId,
                job: jobId,
                referredBy: userId,
                aiMatchScore: aiMatchScore || 0,
                aiAnalysis: aiAnalysis || '',
                notes: notes || '',
                status: 'pending'
            });

            res.status(201).json(referral);
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(409).json({ error: 'Duplicate referral' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Get all referrals with filters
    async getAllReferrals(req: AuthRequest, res: Response) {
        try {
            const status = req.query.status as string;
            const query: any = {};
            if (status && status !== 'all') query.status = status;

            const referrals = await Referral.find(query)
                .populate({
                    path: 'candidate',
                    select: 'firstName lastName currentTitle skills'
                })
                .populate({
                    path: 'job',
                    select: 'title company location employmentType salaryRange'
                })
                .populate({
                    path: 'referredBy',
                    select: 'firstName lastName'
                })
                .sort({ referredAt: -1 })
                .lean();

            res.json(referrals);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Candidate: Get my referrals
    async getMyReferrals(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const candidate = await Candidate.findOne({ user: userId });
            if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

            const referrals = await Referral.find({ candidate: candidate._id })
                .populate({
                    path: 'job',
                    select: 'title company location employmentType salaryRange description requiredSkills preferredSkills experienceRequired'
                })
                .sort({ referredAt: -1 })
                .lean();

            res.json(referrals);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Candidate: Respond to referral (accept/decline)
    async respondToReferral(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { referralId } = req.params;
            const { action, message } = req.body; // action: 'accepted' | 'declined'

            if (!['accepted', 'declined'].includes(action)) {
                return res.status(400).json({ error: 'Action must be "accepted" or "declined"' });
            }

            const candidate = await Candidate.findOne({ user: userId });
            if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

            const referral = await Referral.findOne({
                _id: referralId,
                candidate: candidate._id,
                status: 'pending' // can only respond to pending referrals
            });

            if (!referral) {
                return res.status(404).json({ error: 'Referral not found or already responded' });
            }

            referral.status = action;
            referral.candidateResponse = message || '';
            referral.updatedAt = new Date();
            await referral.save();

            res.json(referral);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Super Admin: Update referral status in pipeline
    async updateReferralStatus(req: AuthRequest, res: Response) {
        try {
            const { referralId } = req.params;
            const { status, notes } = req.body;

            const validStatuses = ['pending', 'accepted', 'interviewing', 'hired', 'declined'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
            }

            const referral = await Referral.findByIdAndUpdate(
                referralId,
                {
                    status,
                    ...(notes && { notes }),
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!referral) return res.status(404).json({ error: 'Referral not found' });

            res.json(referral);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const referralController = new ReferralController();
