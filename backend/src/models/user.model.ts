import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    role: 'admin' | 'recruiter' | 'candidate';
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using OAuth only later
    role: { type: String, enum: ['admin', 'recruiter', 'candidate'], default: 'candidate' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
