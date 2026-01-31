import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    skills: string[];
    experience: number; // Years
    email: string; // Added for notifications
    status: 'pending' | 'interviewing' | 'hired' | 'rejected'; // Hiring status
    institution: string; // Education/Source
    resumeUrl?: string;
    bio?: string;
}

const CandidateSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'interviewing', 'hired', 'rejected'], default: 'pending' },
    institution: { type: String, required: true },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 },
    resumeUrl: { type: String },
    bio: { type: String },
}, { timestamps: true });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
