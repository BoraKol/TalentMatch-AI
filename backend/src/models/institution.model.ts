import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitution extends Document {
    name: string;
    emailDomain: string; // e.g., @company.com
    adminEmail: string;
    website?: string;
    logoUrl?: string;
    type?: string; // 'Company' | 'University' etc.
    status: 'active' | 'pending' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

const InstitutionSchema: Schema = new Schema({
    name: { type: String, required: true },
    emailDomain: { type: String, required: true }, // Removed unique - multiple employers can share same company domain
    adminEmail: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    type: { type: String, default: 'Company' },
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'pending' }
}, { timestamps: true });

// Index for faster lookups, but not unique
InstitutionSchema.index({ emailDomain: 1 });

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);

