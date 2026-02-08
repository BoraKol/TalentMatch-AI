import mongoose, { Schema, Document } from 'mongoose';

export type InstitutionType = 'university' | 'company' | 'organization';

export interface IInstitution extends Document {
    name: string;
    emailDomain: string; // e.g., @company.com
    adminEmail: string;
    website?: string;
    logoUrl?: string;
    institutionType: InstitutionType;
    maxUsers: number; // Default 5 users per institution
    status: 'active' | 'pending' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

const InstitutionSchema: Schema = new Schema({
    name: { type: String, required: true },
    emailDomain: { type: String, required: true },
    adminEmail: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    institutionType: {
        type: String,
        enum: ['university', 'company', 'organization'],
        default: 'company'
    },
    maxUsers: { type: Number, default: 5 },
    status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'pending' }
}, { timestamps: true });

// Index for faster lookups
InstitutionSchema.index({ emailDomain: 1 });

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);

