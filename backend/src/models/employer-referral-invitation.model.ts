import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployerReferralInvitation extends Document {
    employer: mongoose.Types.ObjectId;
    referralPerson: mongoose.Types.ObjectId;
    jobTitle?: string;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployerReferralInvitationSchema: Schema = new Schema({
    employer: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
    referralPerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobTitle: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    message: { type: String },
}, { timestamps: true });

export default mongoose.model<IEmployerReferralInvitation>('EmployerReferralInvitation', EmployerReferralInvitationSchema);
