import { BaseRepository } from './base.repository';
import Job, { IJob } from '../models/job.model';

export class JobRepository extends BaseRepository<IJob> {
    constructor() {
        super(Job);
    }

    async findActive() {
        return await Job.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }

    async getTopEmployers() {
        return await Job.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }

    async getJobCategoryDistribution() {
        return await Job.aggregate([
            { $group: { _id: "$employmentType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }
}
export const jobRepository = new JobRepository();
