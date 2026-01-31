import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
    institution: mongoose.Types.ObjectId;
    name: string;
    deanName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SchoolSchema: Schema = new Schema({
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    deanName: { type: String },
}, { timestamps: true });

export default mongoose.model<ISchool>('School', SchoolSchema);
