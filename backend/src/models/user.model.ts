import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super_admin' | 'institution_admin' | 'institution_user' | 'employer' | 'candidate';

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    role: UserRole;
    institution?: mongoose.Types.ObjectId; // Links to Institution for org users
    invitedBy?: mongoose.Types.ObjectId; // Tracks who invited this user
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using OAuth only later
    firstName: { type: String },
    lastName: { type: String },
    isActive: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ['super_admin', 'institution_admin', 'institution_user', 'employer', 'candidate'],
        default: 'candidate'
    },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Index for faster institution user lookups
UserSchema.index({ institution: 1, role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
