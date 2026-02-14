import Job from '../models/job.model';

export class JobService {

    async getMyJobs(userId: string) {
        return await Job.find({ postedBy: userId, isActive: true }).sort({ createdAt: -1 });
    }

    async getAllJobs() {
        return await Job.find({ isActive: true }).sort({ createdAt: -1 });
    }

    async getJobById(id: string) {
        const job = await Job.findById(id);
        if (!job) {
            throw new Error('Job not found');
        }
        return job;
    }

    async createJob(data: any, userId: string) {
        const {
            title,
            description,
            company,
            location,
            salaryRange,
            requirements,
            requiredSkills,
            preferredSkills,
            employmentType,
            experienceRequired
        } = data;

        const job = await Job.create({
            title,
            description,
            company,
            location,
            salaryRange,
            requirements: requirements || requiredSkills || [],
            requiredSkills: requiredSkills || [],
            preferredSkills: preferredSkills || [],
            employmentType: employmentType || 'Full-time',
            experienceRequired: experienceRequired || 0,
            postedBy: userId,
            isActive: true
        });

        return job;
    }

    async updateJob(id: string, data: any) {
        const job = await Job.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        if (!job) {
            throw new Error('Job not found');
        }
        return job;
    }

    async deleteJob(id: string) {
        const job = await Job.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!job) {
            throw new Error('Job not found');
        }
        return { message: 'Job deleted successfully' };
    }
}

export const jobService = new JobService();
