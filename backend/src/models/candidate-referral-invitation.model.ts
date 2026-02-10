import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateReferralInvitation extends Document {
    referralPerson: mongoose.Types.ObjectId;
    candidate: mongoose.Types.ObjectId;
    jobTitle?: string; // Job they are being referred for
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CandidateReferralInvitationSchema: Schema = new Schema({
    referralPerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    jobTitle: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    message: { type: String },
}, { timestamps: true });

export default mongoose.model<ICandidateReferralInvitation>('CandidateReferralInvitation', CandidateReferralInvitationSchema);
