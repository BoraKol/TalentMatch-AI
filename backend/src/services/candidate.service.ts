import { BaseService } from './base.service';
import Candidate, { ICandidate } from '../models/candidate.model';

export class CandidateService extends BaseService<ICandidate> {
    constructor() {
        super(Candidate);
    }
}

export const candidateService = new CandidateService();
