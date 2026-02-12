import Invite, { IInvite } from '../models/admin-invite.model';
import { BaseRepository } from './base.repository';
import { FilterQuery } from 'mongoose';

export class InviteRepository extends BaseRepository<IInvite> {
    constructor() {
        super(Invite);
    }

    async findActiveInviteByToken(token: string): Promise<IInvite | null> {
        return await this.findOneByFilter({
            token,
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false }
        });
    }

    async findActiveByEmail(email: string): Promise<IInvite | null> {
        return await this.findOneByFilter({
            email,
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false }
        });
    }
}

export const inviteRepository = new InviteRepository();
