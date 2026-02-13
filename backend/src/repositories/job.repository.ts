import { BaseRepository } from './base.repository';
import Job, { IJob } from '../models/job.model';

export class JobRepository extends BaseRepository<IJob> {
    constructor() {
        super(Job);
    }

    async findActive() {
        return await this.model.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }

    async findActiveWithFilters(filters: any) {
        const query: any = { isActive: true };
        if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
        if (filters.type) query.employmentType = filters.type;
        return await this.model.find(query).sort({ createdAt: -1 }).lean();
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
