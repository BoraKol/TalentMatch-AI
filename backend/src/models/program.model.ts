import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
    department: mongoose.Types.ObjectId;
    name: string; // e.g., B.Sc. Computer Science
    degreeLevel: 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Certificate';
    durationMonths?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProgramSchema: Schema = new Schema({
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
    degreeLevel: { type: String, enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'], default: 'Bachelor' },
    durationMonths: { type: Number },
}, { timestamps: true });

export default mongoose.model<IProgram>('Program', ProgramSchema);
