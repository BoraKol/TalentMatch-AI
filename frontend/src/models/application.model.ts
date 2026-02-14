import { Job } from './job.model';

export interface Application {
    _id: string;
    job: Job;
    status: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired';
    aiMatchScore: number;
    createdAt: string;
    candidate?: string; // ID of the candidate
}
