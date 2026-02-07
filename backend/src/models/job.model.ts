import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    description: string;
    requirements: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    employmentType: string;
    experienceRequired: number;
    location: string;
    company: string;
    salaryRange?: string;
    postedBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    employmentType: { type: String, default: 'Full-time' },
    experienceRequired: { type: Number, default: 0 },
    location: { type: String },
    company: { type: String, required: true },
    salaryRange: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);

