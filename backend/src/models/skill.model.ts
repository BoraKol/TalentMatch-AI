import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
    name: string;
    category?: string; // e.g. "Programming", "Design"
    isActive: boolean;
}

const SkillSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ISkill>('Skill', SkillSchema);
