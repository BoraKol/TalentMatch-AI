import mongoose, { Schema, Document } from 'mongoose';

export type InviteType = 'super_admin' | 'institution' | 'employer' | 'candidate';

export interface IInvite extends Document {
    email: string;
    token: string;
    inviteType: InviteType;
    institutionId?: mongoose.Types.ObjectId; // For employer/institution_user invites
    invitedBy: mongoose.Types.ObjectId;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}

const InviteSchema: Schema = new Schema({
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    inviteType: {
        type: String,
        enum: ['super_admin', 'institution', 'employer', 'candidate'],
        required: true
    },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date }
}, { timestamps: true });

// Indexes
InviteSchema.index({ token: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
InviteSchema.index({ email: 1, inviteType: 1 });

export default mongoose.model<IInvite>('Invite', InviteSchema);
