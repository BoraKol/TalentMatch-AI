import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
    department: mongoose.Types.ObjectId;
    name: string; // e.g. "B.Sc. in Computer Science"
    level: string; // e.g. "Bachelor", "Master", "PhD"
    isActive: boolean;
}

const ProgramSchema: Schema = new Schema({
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
    level: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IProgram>('Program', ProgramSchema);
