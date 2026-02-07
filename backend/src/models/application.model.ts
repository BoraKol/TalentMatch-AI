import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    job: mongoose.Types.ObjectId;
    candidate: mongoose.Types.ObjectId;
    status: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired';
    aiMatchScore?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    status: {
        type: String,
        enum: ['applied', 'reviewing', 'interviewing', 'rejected', 'hired'],
        default: 'applied'
    },
    aiMatchScore: { type: Number },
    notes: { type: String }
}, {
    timestamps: true
});

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
