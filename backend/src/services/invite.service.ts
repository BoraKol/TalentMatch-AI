import crypto from 'crypto';
import { IInvite, InviteType } from '../models/admin-invite.model';
import { inviteRepository, InviteRepository } from '../repositories/invite.repository';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { institutionRepository, InstitutionRepository } from '../repositories/institution.repository';
import { userFactory, UserFactory } from './user-factory.service';

export class InviteService {
    private inviteRepo: InviteRepository;
    private userRepo: UserRepository;
    private institutionRepo: InstitutionRepository;
    private factory: UserFactory;

    constructor() {
        this.inviteRepo = inviteRepository;
        this.userRepo = userRepository;
        this.institutionRepo = institutionRepository;
        this.factory = userFactory;
    }

    async sendInvite(data: { email: string, inviteType: InviteType, institutionId?: string, inviterId?: string }) {
        const { email, inviteType, institutionId, inviterId } = data;

        // Check user existence
        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check active invite existence
        const existingInvite = await this.inviteRepo.findActiveByEmail(email);
        if (existingInvite) {
            throw new Error('An active invite already exists for this email');
        }

        // Check institution limits if applicable
        if (institutionId) {
            const institution = await this.institutionRepo.findOne(institutionId);
            if (!institution) {
                throw new Error('Institution not found');
            }
            const userCount = await this.userRepo.count({ institution: institution._id });
            if (userCount >= (institution.maxUsers || 5)) {
                throw new Error(`Institution has reached maximum user limit (${institution.maxUsers || 5})`);
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const invite = await this.inviteRepo.create({
            email,
            token,
            inviteType,
            institutionId: institutionId as any,
            invitedBy: inviterId as any,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/accept-invite/${token}`;

        return {
            inviteLink,
            inviteType: invite.inviteType,
            expiresAt: invite.expiresAt
        };
    }

    async verifyInvite(token: string) {
        const invite = await this.inviteRepo.findActiveInviteByToken(token);
        if (!invite) {
            throw new Error('Invalid or expired invite');
        }

        await invite.populate('institutionId', 'name');

        return {
            valid: true,
            email: invite.email,
            inviteType: invite.inviteType,
            institutionName: (invite.institutionId as any)?.name,
            expiresAt: invite.expiresAt
        };
    }

    async acceptInvite(data: { token: string, firstName: string, lastName: string, password?: string, additionalData?: any }) {
        const { token, firstName, lastName, password, additionalData } = data;

        const invite = await this.inviteRepo.findActiveInviteByToken(token);
        if (!invite) {
            throw new Error('Invalid or expired invite');
        }

        let institutionId = invite.institutionId?.toString();

        // Specific logic for types
        if (invite.inviteType === 'institution') {
            const institution = await this.institutionRepo.create({
                name: additionalData?.institutionName || `${firstName}'s Institution`,
                emailDomain: invite.email.split('@')[1],
                adminEmail: invite.email,
                institutionType: additionalData?.institutionType || 'organization',
                website: additionalData?.website,
                status: 'active'
            });
            institutionId = institution._id.toString();
        } else if (invite.inviteType === 'employer' && !institutionId) {
            const institution = await this.institutionRepo.create({
                name: additionalData?.companyName || `${firstName}'s Company`,
                emailDomain: invite.email.split('@')[1],
                adminEmail: invite.email,
                institutionType: 'company',
                website: additionalData?.website,
                status: 'active'
            });
            institutionId = institution._id.toString();
        }

        const user = await this.factory.createUser({
            email: invite.email,
            password,
            firstName,
            lastName,
            role: this.mapInviteToRole(invite.inviteType),
            institutionId,
            invitedBy: invite.invitedBy?.toString(),
            isActive: true, // Invited users are active immediately after setup
            additionalData
        });

        invite.usedAt = new Date();
        await invite.save();

        return {
            message: `${invite.inviteType} account created successfully`,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }

    private mapInviteToRole(type: InviteType): any {
        switch (type) {
            case 'super_admin': return 'super_admin';
            case 'institution': return 'institution_admin';
            case 'employer': return 'employer';
            case 'candidate': return 'candidate';
            default: return 'candidate';
        }
    }

    async getPendingInvites(type?: string) {
        const query: any = {
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false }
        };
        if (type) query.inviteType = type;

        return await this.inviteRepo.find(query);
    }

    async revokeInvite(id: string) {
        return await this.inviteRepo.delete(id);
    }

    async getInstitutionUsers(institutionId: string): Promise<any> {
        const institution = await this.institutionRepo.findOne(institutionId);
        if (!institution) {
            throw new Error('Institution not found');
        }

        const users = await this.userRepo.find({ institution: institution._id });

        return {
            institution: {
                id: institution._id,
                name: institution.name,
                maxUsers: institution.maxUsers
            },
            currentCount: users.length,
            remainingSlots: Math.max(0, (institution.maxUsers || 5) - users.length),
            users: users.map(u => ({
                id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt
            }))
        };
    }
}


export const inviteService = new InviteService();
