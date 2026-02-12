import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    user?: mongoose.Types.ObjectId; // Optional link to User account
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    skills: string[]; // Legacy
    primarySkills: string[];
    secondarySkills: string[];
    softSkills: string[];
    experience: number; // Years
    currentTitle?: string;
    status: 'pending' | 'interviewing' | 'hired' | 'rejected';
    institution?: string;
    school?: string;
    department?: string;
    program?: string;
    region?: string;
    country?: string;
    resumeUrl?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CandidateSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    currentTitle: { type: String, default: 'Open to Work' },
    phone: { type: String },
    status: { type: String, enum: ['pending', 'interviewing', 'hired', 'rejected'], default: 'pending' },
    institution: { type: String }, // Keeping for backwards compatibility
    school: { type: String }, // ID or Name from School model
    department: { type: String },
    program: { type: String },
    region: { type: String },
    country: { type: String },
    skills: [{ type: String }],
    primarySkills: [{ type: String }],
    secondarySkills: [{ type: String }],
    softSkills: [{ type: String }],
    experience: { type: Number, default: 0 },
    resumeUrl: { type: String },
    bio: { type: String },
}, { timestamps: true });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);

// Indexes
CandidateSchema.index({ user: 1 }); // Fast profile lookup by user ID
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ skills: 1 }); // Multikey for skill-based searches
CandidateSchema.index({ status: 1 });

