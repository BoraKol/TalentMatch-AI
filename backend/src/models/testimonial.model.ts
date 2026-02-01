import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
    authorName: string;
    role: string;
    companyOrInstitution: string;
    content: string;
    avatarUrl?: string;
    isActive: boolean;
}

const TestimonialSchema: Schema = new Schema({
    authorName: { type: String, required: true },
    role: { type: String, required: true },
    companyOrInstitution: { type: String },
    content: { type: String, required: true },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
