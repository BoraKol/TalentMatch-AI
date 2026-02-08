import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminInvite extends Document {
    email: string;
    token: string;
    invitedBy: mongoose.Types.ObjectId;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}

const AdminInviteSchema: Schema = new Schema({
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
}, { timestamps: true });

// Index for quick token lookup and cleanup
AdminInviteSchema.index({ token: 1 });
AdminInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAdminInvite>('AdminInvite', AdminInviteSchema);
