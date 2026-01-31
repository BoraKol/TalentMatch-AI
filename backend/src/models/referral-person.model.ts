import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralPerson extends Document {
    user?: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReferralPersonSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    company: { type: String },
    position: { type: String },
}, { timestamps: true });

export default mongoose.model<IReferralPerson>('ReferralPerson', ReferralPersonSchema);
