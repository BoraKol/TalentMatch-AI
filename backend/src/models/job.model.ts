import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    description: string;
    requirements: string[];
    location: string;
    company: string;
    salaryRange?: string;
    postedBy: mongoose.Types.ObjectId;
    isActive: boolean;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String },
    company: { type: String, required: true },
    salaryRange: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);
