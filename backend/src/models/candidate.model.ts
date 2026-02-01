import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    user?: mongoose.Types.ObjectId; // Optional link to User account
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: number; // Years
    currentTitle?: string;
    status: 'pending' | 'interviewing' | 'hired' | 'rejected';
    institution?: string;
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
    experience: { type: Number, default: 0 },
    resumeUrl: { type: String },
    bio: { type: String },
}, { timestamps: true });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
