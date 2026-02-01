import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
    institution: mongoose.Types.ObjectId;
    name: string; // e.g. "School of Engineering"
    isActive: boolean;
}

const SchoolSchema: Schema = new Schema({
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ISchool>('School', SchoolSchema);
