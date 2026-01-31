import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    school: mongoose.Types.ObjectId;
    name: string; // e.g., Computer Science
    headOfDepartment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema({
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    headOfDepartment: { type: String },
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
