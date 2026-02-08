import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
    name: string;
    category?: string; // e.g. "Software Development", "Cloud & DevOps"
    subcategory?: string; // e.g. "Frontend", "Backend", "AI/ML"
    skillType: 'technical' | 'soft' | 'nice_to_have';
    isActive: boolean;
}

const SkillSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String },
    subcategory: { type: String },
    skillType: { type: String, enum: ['technical', 'soft', 'nice_to_have'], default: 'technical' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ISkill>('Skill', SkillSchema);
