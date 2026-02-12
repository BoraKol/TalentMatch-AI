import { BaseRepository } from './base.repository';
import Candidate, { ICandidate } from '../models/candidate.model';

export class CandidateRepository extends BaseRepository<ICandidate> {
    constructor() {
        super(Candidate);
    }

    // Add specific methods here if needed
    async findByEmail(email: string): Promise<ICandidate | null> {
        // Note: Assuming email is in the User model populate, or added to Candidate
        // For now, let's assuming lookup by name or specific query
        // If email is in Candidate directly:
        // return this.findOne({ email });
        return null;
    }
}
export const candidateRepository = new CandidateRepository();
