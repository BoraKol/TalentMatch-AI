import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployer extends Document {
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
    name: { type: String, required: true, unique: true },
    industry: { type: String },
    website: { type: String },
    description: { type: String },
    location: { type: String },
    contactEmail: { type: String },
}, { timestamps: true });

export default mongoose.model<IEmployer>('Employer', EmployerSchema);
