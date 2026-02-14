import { Job } from './job.model';

export interface ReferralPosition {
    _id: string;
    job: Job;
    status: 'pending' | 'accepted' | 'declined' | 'interviewing' | 'hired';
    aiMatchScore: number;
    aiAnalysis: string;
    referredAt: string;
    candidateResponse?: string;
}
