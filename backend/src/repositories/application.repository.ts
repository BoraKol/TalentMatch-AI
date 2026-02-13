import { BaseRepository } from './base.repository';
import Application, { IApplication } from '../models/application.model';

export class ApplicationRepository extends BaseRepository<IApplication> {
    constructor() {
        super(Application);
    }

    async findByCandidate(candidateId: string) {
        return await this.model.find({ candidate: candidateId }).sort({ createdAt: -1 }).lean();
    }

    async findByJob(jobId: string) {
        return await this.model.find({ job: jobId }).populate('candidate').sort({ createdAt: -1 }).lean();
    }

    async hasApplied(candidateId: string, jobId: string): Promise<boolean> {
        const count = await this.model.countDocuments({ candidate: candidateId, job: jobId });
        return count > 0;
    }
}

export const applicationRepository = new ApplicationRepository();
