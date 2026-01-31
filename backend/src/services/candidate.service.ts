import { CandidateRepository } from '../repositories/candidate.repository';
import { ICandidate } from '../models/candidate.model';

export class CandidateService {
    private candidateRepository: CandidateRepository;

    constructor() {
        this.candidateRepository = new CandidateRepository();
    }

    async getAllCandidates(): Promise<ICandidate[]> {
        return await this.candidateRepository.retrieve();
    }

    async createCandidate(data: Partial<ICandidate>): Promise<ICandidate> {
        return await this.candidateRepository.create(data);
    }

    async getCandidateById(id: string): Promise<ICandidate | null> {
        return await this.candidateRepository.findOne(id);
    }
}
