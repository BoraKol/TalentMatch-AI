import { BaseRepository } from './base.repository';
import { Referral, IReferral } from '../models/referral.model';
import { Model } from 'mongoose';

export class ReferralRepository extends BaseRepository<IReferral> {
    constructor() {
        super(Referral as unknown as Model<IReferral>);
    }

    async findWithDetails(query: any) {
        return await Referral.find(query)
            .populate({
                path: 'candidate',
                select: 'firstName lastName currentTitle skills user',
                populate: { path: 'user', select: 'institution' }
            })
            .populate({ path: 'job', select: 'title company location employmentType salaryRange' })
            .populate({ path: 'referredBy', select: 'firstName lastName' })
            .sort({ referredAt: -1 })
            .lean();
    }

    async findByCandidate(candidateId: string) {
        return await Referral.find({ candidate: candidateId })
            .populate({
                path: 'job',
                select: 'title company location employmentType salaryRange description requiredSkills preferredSkills experienceRequired'
            })
            .sort({ referredAt: -1 })
            .lean();
    }
}

export const referralRepository = new ReferralRepository();
