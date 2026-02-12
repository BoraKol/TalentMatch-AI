
import { z } from 'zod';

export const CreateReferralSchema = z.object({
    candidateId: z.string().min(1, 'Candidate ID is required'),
    jobId: z.string().min(1, 'Job ID is required'),
    aiMatchScore: z.number().min(0).max(100).optional(),
    aiAnalysis: z.string().optional(),
    notes: z.string().optional()
});

export const RespondReferralSchema = z.object({
    action: z.enum(['accepted', 'declined'], { errorMap: () => ({ message: 'Action must be "accepted" or "declined"' }) }),
    message: z.string().optional()
});

export const UpdateReferralStatusSchema = z.object({
    status: z.enum(['pending', 'accepted', 'interviewing', 'hired', 'declined'], { errorMap: () => ({ message: 'Invalid status' }) }),
    notes: z.string().optional()
});
