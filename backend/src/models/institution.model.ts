import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitution extends Document {
    name: string;
    type?: string; // University, College, Bootcamp
    location?: string;
    website?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InstitutionSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String },
    location: { type: String },
    website: { type: String },
}, { timestamps: true });

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);
