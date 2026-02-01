import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitution extends Document {
    name: string;
    emailDomain: string; // e.g., @mit.edu
    adminEmail: string;
    website?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const InstitutionSchema: Schema = new Schema({
    name: { type: String, required: true },
    emailDomain: { type: String, required: true, unique: true },
    adminEmail: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);
