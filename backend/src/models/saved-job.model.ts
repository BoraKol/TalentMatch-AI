import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJob extends Document {
    candidate: mongoose.Types.ObjectId;
    job: mongoose.Types.ObjectId;
    savedAt: Date;
}

const SavedJobSchema: Schema = new Schema({
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    savedAt: { type: Date, default: Date.now }
});

// Prevent duplicate saves
SavedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
