import mongoose from 'mongoose';

export interface IReferral {
    candidate: mongoose.Types.ObjectId;
    job: mongoose.Types.ObjectId;
    referredBy: mongoose.Types.ObjectId; // super_admin user
    status: 'pending' | 'accepted' | 'interviewing' | 'hired' | 'declined';
    aiMatchScore: number;
    aiAnalysis: string;
    notes: string;
    candidateResponse?: string; // candidate's message when accepting/declining
    referredAt: Date;
    updatedAt: Date;
}

const referralSchema = new mongoose.Schema({
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'interviewing', 'hired', 'declined'],
        default: 'pending'
    },
    aiMatchScore: { type: Number, default: 0 },
    aiAnalysis: { type: String, default: '' },
    notes: { type: String, default: '' },
    candidateResponse: { type: String, default: '' },
    referredAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate referrals
referralSchema.index({ candidate: 1, job: 1 }, { unique: true });
referralSchema.index({ candidate: 1, status: 1 });
referralSchema.index({ referredBy: 1 });

export const Referral = mongoose.model('Referral', referralSchema);
