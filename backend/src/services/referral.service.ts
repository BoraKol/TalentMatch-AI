
import { Referral, IReferral } from '../models/referral.model';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';
import { aiMatchingService } from './ai-matching.service';
import emailService from './email.service';
import { CreateReferralSchema, RespondReferralSchema, UpdateReferralStatusSchema } from '../validators/referral.validator';

export class ReferralService {

    async getCandidatesForReferral(search?: string) {
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

        return candidates.map((c: any) => ({
            _id: c._id,
            name: `${c.firstName} ${c.lastName}`,
            email: (c.user as any)?.email || '',
            title: c.currentTitle || 'Open to Work',
            skills: c.skills || [],
            experience: c.experience || 0,
            school: c.school || '',
            department: c.department || ''
        }));
    }

    async getMatchesForCandidate(candidateId: string) {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) throw new Error('Candidate not found');

        const matches = await aiMatchingService.findTopJobsForCandidate(candidateId);

        const existingReferrals = await Referral.find({ candidate: candidateId })
            .select('job status')
            .lean();

        const referredJobMap = new Map(
            existingReferrals.map(r => [r.job.toString(), r.status])
        );

        return {
            candidate: {
                _id: candidate._id,
                name: `${candidate.firstName} ${candidate.lastName}`,
                title: candidate.currentTitle,
                skills: candidate.skills
            },
            matches: matches.map(m => ({
                ...m,
                referralStatus: referredJobMap.get(m.id) || null,
                isReferred: referredJobMap.has(m.id)
            }))
        };
    }

    async createReferral(userId: string, data: { candidateId: string; jobId: string; aiMatchScore?: number; aiAnalysis?: string; notes?: string }) {
        // Validation
        const validated = await CreateReferralSchema.parseAsync(data);
        const { candidateId, jobId, aiMatchScore, aiAnalysis, notes } = validated;

        const [candidate, job] = await Promise.all([
            Candidate.findById(candidateId).populate('user', 'email'),
            Job.findById(jobId)
        ]);

        if (!candidate) throw new Error('Candidate not found');
        if (!job) throw new Error('Job not found');

        const existing = await Referral.findOne({ candidate: candidateId, job: jobId });
        if (existing) {
            const error: any = new Error('This candidate has already been referred to this job');
            error.code = 11000;
            throw error;
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

        // Email Notification
        try {
            const candidateEmail = (candidate.user as any)?.email;
            const candidateName = `${candidate.firstName} ${candidate.lastName}`;

            if (candidateEmail) {
                await emailService.sendReferralNotification(
                    candidateEmail,
                    candidateName,
                    job.title,
                    job.company,
                    referral._id.toString()
                );
            }
        } catch (emailError) {
            console.error('Failed to send referral email:', emailError);
        }

        return referral;
    }

    async getAllReferrals(status?: string) {
        const query: any = {};
        if (status && status !== 'all') query.status = status;

        return await Referral.find(query)
            .populate({ path: 'candidate', select: 'firstName lastName currentTitle skills' })
            .populate({ path: 'job', select: 'title company location employmentType salaryRange' })
            .populate({ path: 'referredBy', select: 'firstName lastName' })
            .sort({ referredAt: -1 })
            .lean();
    }

    async getMyReferrals(userId: string) {
        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) throw new Error('Candidate profile not found');

        return await Referral.find({ candidate: candidate._id })
            .populate({
                path: 'job',
                select: 'title company location employmentType salaryRange description requiredSkills preferredSkills experienceRequired'
            })
            .sort({ referredAt: -1 })
            .lean();
    }

    async respondToReferral(userId: string, referralId: string, action: 'accepted' | 'declined', message?: string) {
        // Validation
        await RespondReferralSchema.parseAsync({ action, message });

        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) throw new Error('Candidate profile not found');

        const referral = await Referral.findOne({
            _id: referralId,
            candidate: candidate._id,
            status: 'pending'
        });

        if (!referral) throw new Error('Referral not found or already responded');

        referral.status = action;
        referral.candidateResponse = message || '';
        referral.updatedAt = new Date();
        return await referral.save();
    }

    async updateReferralStatus(referralId: string, status: string, notes?: string) {
        // Validation
        await UpdateReferralStatusSchema.parseAsync({ status, notes });

        const referral = await Referral.findByIdAndUpdate(
            referralId,
            { status, ...(notes && { notes }), updatedAt: new Date() },
            { new: true }
        );

        if (!referral) throw new Error('Referral not found');

        return referral;
    }
}

export const referralService = new ReferralService();
