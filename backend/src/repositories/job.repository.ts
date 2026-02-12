import Job, { IJob } from '../models/job.model';
import { BaseRepository } from './base.repository';

export class JobRepository extends BaseRepository<IJob> {
    constructor() {
        super(Job);
    }

    async findActiveJobs(): Promise<IJob[]> {
        return await this.find({ isActive: true });
    }
}

export const jobRepository = new JobRepository();
