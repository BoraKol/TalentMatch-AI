import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    role: 'super_admin' | 'institution_admin' | 'candidate';
    institution?: any; // ObjectId
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using OAuth only later
    firstName: { type: String },
    lastName: { type: String },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['super_admin', 'institution_admin', 'candidate'], default: 'candidate' },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
