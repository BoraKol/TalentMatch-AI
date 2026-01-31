import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId; // User receiving the notification
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    relatedEntityId?: mongoose.Types.ObjectId; // Generic link to related object (e.g. Invitation ID)
    relatedEntityModel?: string; // e.g. 'CandidateReferralInvitation'
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityModel: { type: String },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
