import Application, { IApplication } from '../models/application.model';
import Job from '../models/job.model';
import Candidate from '../models/candidate.model';

export class ApplicationService {
    async applyForJob(candidateId: string, jobId: string, aiMatchScore?: number): Promise<IApplication> {
        // Validation
        const existingApp = await Application.findOne({ candidate: candidateId, job: jobId });
        if (existingApp) {
            throw new Error('You have already applied for this job');
        }

        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) throw new Error('Candidate not found');

        // Create Application
        const application = new Application({
            candidate: candidateId,
            job: jobId,
            status: 'applied',
            aiMatchScore: aiMatchScore || 0
        });

        await application.save();
        return application;
    }

    async getCandidateApplications(candidateId: string): Promise<IApplication[]> {
        return await Application.find({ candidate: candidateId })
            .populate('job', 'title company location employmentType salaryRange requiredSkills isActive createdAt')
            .sort({ createdAt: -1 });
    }
}

export const applicationService = new ApplicationService();
