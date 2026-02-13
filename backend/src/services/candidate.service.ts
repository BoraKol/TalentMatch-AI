import { BaseService } from './base.service';
import Candidate, { ICandidate } from '../models/candidate.model';
import { candidateRepository } from '../repositories/candidate.repository';
import { userRepository } from '../repositories/user.repository';

export class CandidateService extends BaseService<ICandidate> {
    constructor() {
        super(Candidate);
    }

    async updateProfile(candidateId: string, updates: any) {
        const candidate = await candidateRepository.findOne(candidateId);
        if (!candidate) {
            throw new Error('Candidate not found');
        }

        // Update User model if name/email changed
        if (candidate.user && (updates.firstName || updates.lastName || updates.email)) {
            const userUpdates: any = {};
            if (updates.firstName) userUpdates.firstName = updates.firstName;
            if (updates.lastName) userUpdates.lastName = updates.lastName;
            if (updates.email) userUpdates.email = updates.email;

            await userRepository.update(candidate.user.toString(), userUpdates);
        }

        return await candidateRepository.update(candidateId, updates);
    }

    async getByUserId(userId: string) {
        const candidates = await candidateRepository.findWithUser({ user: userId });
        return candidates.length > 0 ? candidates[0] : null;
    }
}

export const candidateService = new CandidateService();
