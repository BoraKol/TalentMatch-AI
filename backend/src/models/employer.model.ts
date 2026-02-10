import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployer extends Document {
    user: mongoose.Types.ObjectId;
    institution: mongoose.Types.ObjectId;
    name: string;
    industry?: string;
    website?: string;
    description?: string;
    location?: string;
    contactEmail?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployerSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    industry: { type: String },
    website: { type: String },
    description: { type: String },
    location: { type: String },
    contactEmail: { type: String },
}, { timestamps: true });

// Index for institution lookups
EmployerSchema.index({ institution: 1 });

export default mongoose.model<IEmployer>('Employer', EmployerSchema);
