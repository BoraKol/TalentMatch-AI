import { BaseRepository } from './base.repository';
import SavedJob, { ISavedJob } from '../models/saved-job.model';

export class SavedJobRepository extends BaseRepository<ISavedJob> {
    constructor() {
        super(SavedJob);
    }

    async findByCandidate(candidateId: string) {
        return await this.model.find({ candidate: candidateId }).populate('job').sort({ createdAt: -1 }).lean();
    }

    async isSaved(candidateId: string, jobId: string): Promise<boolean> {
        const count = await this.model.countDocuments({ candidate: candidateId, job: jobId });
        return count > 0;
    }
}

export const savedJobRepository = new SavedJobRepository();
