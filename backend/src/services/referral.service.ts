
import { Referral, IReferral } from '../models/referral.model';
import { candidateRepository } from '../repositories/candidate.repository';
import { referralRepository } from '../repositories/referral.repository';
import { jobRepository } from '../repositories/job.repository';
import { aiMatchingService } from './ai-matching.service';
import emailService from './email.service';
import { CreateReferralSchema, RespondReferralSchema, UpdateReferralStatusSchema } from '../validators/referral.validator';

export class ReferralService {

    async getCandidatesForReferral(search?: string, institutionId?: string) {
        const query: any = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { currentTitle: { $regex: search, $options: 'i' } },
                { skills: { $elemMatch: { $regex: search, $options: 'i' } } }
            ];
        }

        // Use repository with population
        let candidates = await candidateRepository.findWithUser(query);

        // Filter by institution if provided
        if (institutionId) {
            candidates = candidates.filter((c: any) =>
                c.user && c.user.institution && c.user.institution.toString() === institutionId
            );
        }

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

    async autoMatchCandidates(institutionId?: string) {
        // 1. Fetch candidates (for institution if provided, else all)
        const candidates = institutionId
            ? await candidateRepository.findInInstitution(institutionId)
            : await candidateRepository.find({});

        if (candidates.length === 0) return [];

        // 2. Fetch all active jobs
        const jobs = await jobRepository.findActive();
        if (jobs.length === 0) return [];

        // 3. Fetch all existing referrals for these candidates once to avoid N+1 queries
        const candidateIds = candidates.map(c => c._id.toString());
        const existingReferrals = await referralRepository.find({ candidate: { $in: candidateIds } });

        const referralMap = new Map<string, Set<string>>();
        existingReferrals.forEach(r => {
            const cId = r.candidate.toString();
            if (!referralMap.has(cId)) referralMap.set(cId, new Set());
            referralMap.get(cId)!.add(r.job.toString());
        });

        // 4. For each candidate, find best matches (Score > 0, we want best overall)
        const allRecommendations: any[] = [];

        for (const candidate of candidates) {
            const cIdStr = candidate._id.toString();
            const matches = await aiMatchingService.findTopJobsForCandidate(cIdStr);
            const referredJobs = referralMap.get(cIdStr) || new Set<string>();

            // Filter matches that haven't been referred yet
            // We keep ALL matches now to find the absolute best ones platform-wide
            const validMatches = matches.filter(m => !referredJobs.has(m.id));

            if (validMatches.length > 0) {
                // Sort by score
                validMatches.sort((a, b) => b.matchScore - a.matchScore);

                // Best score for this candidate (used for sorting candidates)
                const bestScore = validMatches[0].matchScore;

                allRecommendations.push({
                    bestScore, // Internal use for sorting
                    candidate: {
                        _id: candidate._id,
                        name: `${candidate.firstName} ${candidate.lastName}`,
                        title: candidate.currentTitle
                    },
                    matches: validMatches.slice(0, 3).map(m => ({
                        jobId: m.id,
                        title: m.title,
                        company: m.company,
                        score: m.matchScore,
                        analysis: m.aiAnalysis
                    }))
                });
            }
        }

        // Sort candidates by their best match score (descending) and take top 3
        allRecommendations.sort((a, b) => b.bestScore - a.bestScore);

        // Return top 3 candidates, removing the internal 'bestScore' property if strictness needed (frontend ignores extra props usually)
        return allRecommendations.slice(0, 3);
    }

    async getMatchesForCandidate(candidateId: string) {
        const candidate = await candidateRepository.findOne(candidateId);
        if (!candidate) throw new Error('Candidate not found');

        const matches = await aiMatchingService.findTopJobsForCandidate(candidateId);

        // Find existing referrals for this candidate to mark them
        const existingReferrals = await referralRepository.find({ candidate: candidateId });
        const referredJobIds = new Map(existingReferrals.map(r => [r.job.toString(), r.status]));

        return {
            candidate: {
                name: `${candidate.firstName} ${candidate.lastName}`,
                title: candidate.currentTitle
            },
            matches: matches.map(m => ({
                ...m,
                isReferred: referredJobIds.has(m.id),
                referralStatus: referredJobIds.get(m.id) || null
            }))
        };
    }

    async createReferral(referredBy: string, data: any) {
        // Validation
        const validated = await CreateReferralSchema.parseAsync(data);

        // Check if already referred
        const existing = await referralRepository.findOneByFilter({
            candidate: validated.candidateId,
            job: validated.jobId
        });

        if (existing) {
            throw new Error('This candidate has already been referred to this job');
        }

        const referralData = {
            candidate: validated.candidateId as any,
            job: validated.jobId as any,
            referredBy: referredBy as any,
            status: 'pending' as any,
            aiMatchScore: validated.aiMatchScore,
            aiAnalysis: validated.aiAnalysis,
            notes: validated.notes,
            referredAt: new Date()
        };

        return await referralRepository.create(referralData);
    }

    async getAllReferrals(status?: string, institutionId?: string) {
        const query: any = {};
        if (status && status !== 'all') query.status = status;

        let referrals = await referralRepository.findWithDetails(query);

        if (institutionId) {
            referrals = (referrals as any[]).filter((r: any) =>
                r.candidate?.user?.institution?.toString() === institutionId
            );
        }

        return referrals;
    }

    async getMyReferrals(userId: string) {
        const candidate = await candidateRepository.findOneByFilter({ user: userId });
        if (!candidate) throw new Error('Candidate profile not found');

        return await referralRepository.findByCandidate(candidate._id.toString());
    }

    async respondToReferral(userId: string, referralId: string, action: 'accepted' | 'declined', message?: string) {
        // Validation
        await RespondReferralSchema.parseAsync({ action, message });

        const candidate = await candidateRepository.findOneByFilter({ user: userId });
        if (!candidate) throw new Error('Candidate profile not found');

        const referral = await referralRepository.findOneByFilter({
            _id: referralId,
            candidate: candidate._id,
            status: 'pending'
        });

        if (!referral) throw new Error('Referral not found or already responded');

        return await referralRepository.update(referralId, {
            status: action as any,
            candidateResponse: message || '',
            updatedAt: new Date()
        });
    }

    async updateReferralStatus(referralId: string, status: string, notes?: string) {
        // Validation
        await UpdateReferralStatusSchema.parseAsync({ status, notes });

        const referral = await referralRepository.update(referralId, {
            status: status as any,
            ...(notes && { notes }),
            updatedAt: new Date()
        });

        if (!referral) throw new Error('Referral not found');

        return referral;
    }
}

export const referralService = new ReferralService();
