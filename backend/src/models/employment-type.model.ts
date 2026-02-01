import mongoose, { Schema, Document } from 'mongoose';

export interface IEmploymentType extends Document {
    name: string; // e.g. "Full Time", "Internship"
    level?: string; // Optional level grouping
    isActive: boolean;
}

const EmploymentTypeSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    level: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IEmploymentType>('EmploymentType', EmploymentTypeSchema);
