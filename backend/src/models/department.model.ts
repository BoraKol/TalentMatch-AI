import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    school: mongoose.Types.ObjectId;
    name: string; // e.g. "Computer Science"
    isActive: boolean;
}

const DepartmentSchema: Schema = new Schema({
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
