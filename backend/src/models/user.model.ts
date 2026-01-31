import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    role: 'admin' | 'recruiter' | 'candidate' | 'referrer';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using OAuth only later
    firstName: { type: String },
    lastName: { type: String },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['admin', 'recruiter', 'candidate', 'referrer'], default: 'candidate' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
