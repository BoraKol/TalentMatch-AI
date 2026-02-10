import { Response } from 'express';
import { AuthRequest } from '../types/express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Invite, { InviteType } from '../models/admin-invite.model';
import User from '../models/user.model';
import Institution from '../models/institution.model';
import Candidate from '../models/candidate.model';
import { hashPassword } from '../utils/password';

const MAX_USERS_PER_ORG = 5;

export class InviteController {

    // Get user count for an institution
    private async getInstitutionUserCount(institutionId: string): Promise<number> {
        return await User.countDocuments({ institution: institutionId });
    }

    // Send invite (Super Admin can invite all types)
    async sendInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { email, inviteType, institutionId } = req.body;
            const inviterId = req.user?.id;

            if (!email || !inviteType) {
                res.status(400).json({ error: 'Email and inviteType are required' });
                return;
            }

            // Validate inviteType
            const validTypes: InviteType[] = ['super_admin', 'institution', 'employer', 'candidate'];
            if (!validTypes.includes(inviteType)) {
                res.status(400).json({ error: 'Invalid invite type' });
                return;
            }

            // Check if email already exists as user
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: 'User with this email already exists' });
                return;
            }

            // Check for existing pending invite
            const existingInvite = await Invite.findOne({
                email,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });
            if (existingInvite) {
                res.status(400).json({ error: 'An active invite already exists for this email' });
                return;
            }

            // If inviting to existing institution, check user limit
            if (institutionId) {
                const userCount = await this.getInstitutionUserCount(institutionId);
                const institution = await Institution.findById(institutionId);
                const maxUsers = institution?.maxUsers || MAX_USERS_PER_ORG;

                if (userCount >= maxUsers) {
                    res.status(400).json({
                        error: `Institution has reached maximum user limit (${maxUsers})`
                    });
                    return;
                }
            }

            // Generate secure token
            const token = crypto.randomBytes(32).toString('hex');

            // Create invite (expires in 7 days)
            const invite = await Invite.create({
                email,
                token,
                inviteType,
                institutionId: institutionId || undefined,
                invitedBy: inviterId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            // Generate invite link
            const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/accept-invite/${token}`;

            res.status(201).json({
                message: 'Invite sent successfully',
                inviteLink,
                inviteType,
                expiresAt: invite.expiresAt
            });

        } catch (error: any) {
            console.error('Send Invite Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get pending invites (optionally filter by type)
    async getPendingInvites(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { type } = req.query;

            const query: any = {
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            };

            if (type) {
                query.inviteType = type;
            }

            const invites = await Invite.find(query)
                .populate('invitedBy', 'firstName lastName email')
                .populate('institutionId', 'name')
                .sort({ createdAt: -1 });

            res.json(invites);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Verify invite token (public endpoint)
    async verifyInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { token } = req.params;

            const invite = await Invite.findOne({
                token,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            }).populate('institutionId', 'name');

            if (!invite) {
                res.status(404).json({ error: 'Invalid or expired invite' });
                return;
            }

            res.json({
                valid: true,
                email: invite.email,
                inviteType: invite.inviteType,
                institutionName: (invite.institutionId as any)?.name,
                expiresAt: invite.expiresAt
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Accept invite and create account based on type
    async acceptInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { token, firstName, lastName, password, ...additionalData } = req.body;

            if (!token || !firstName || !lastName || !password) {
                res.status(400).json({ error: 'Token, firstName, lastName, and password are required' });
                return;
            }

            // Find valid invite
            const invite = await Invite.findOne({
                token,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });

            if (!invite) {
                res.status(404).json({ error: 'Invalid or expired invite' });
                return;
            }

            // Hash password
            const hashedPassword = await hashPassword(password);


            let user;
            let institution;

            switch (invite.inviteType) {
                case 'super_admin':
                    user = await User.create({
                        email: invite.email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'super_admin',
                        isActive: true,
                        invitedBy: invite.invitedBy
                    });
                    break;

                case 'institution':
                    // Create new institution
                    institution = await Institution.create({
                        name: additionalData.institutionName || `${firstName}'s Institution`,
                        emailDomain: invite.email.split('@')[1],
                        adminEmail: invite.email,
                        institutionType: additionalData.institutionType || 'organization',
                        website: additionalData.website,
                        status: 'active'
                    });

                    user = await User.create({
                        email: invite.email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'institution_admin',
                        institution: institution._id,
                        isActive: true,
                        invitedBy: invite.invitedBy
                    });
                    break;

                case 'employer':
                    // Create or use existing institution
                    if (invite.institutionId) {
                        institution = await Institution.findById(invite.institutionId);
                    } else {
                        institution = await Institution.create({
                            name: additionalData.companyName || `${firstName}'s Company`,
                            emailDomain: invite.email.split('@')[1],
                            adminEmail: invite.email,
                            institutionType: 'company',
                            website: additionalData.website,
                            status: 'active'
                        });
                    }

                    user = await User.create({
                        email: invite.email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'employer',
                        institution: institution?._id,
                        isActive: true,
                        invitedBy: invite.invitedBy
                    });
                    break;

                case 'candidate':
                    user = await User.create({
                        email: invite.email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'candidate',
                        isActive: true,
                        invitedBy: invite.invitedBy
                    });

                    // Create candidate profile
                    await Candidate.create({
                        user: user._id,
                        firstName,
                        lastName,
                        email: invite.email,
                        skills: additionalData.skills || []
                    });
                    break;
            }

            // Mark invite as used
            invite.usedAt = new Date();
            await invite.save();

            res.status(201).json({
                message: `${invite.inviteType} account created successfully`,
                user: {
                    id: user?._id,
                    email: user?.email,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    role: user?.role
                }
            });

        } catch (error: any) {
            console.error('Accept Invite Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Revoke/Cancel an invite
    async revokeInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { inviteId } = req.params;

            const result = await Invite.findByIdAndDelete(inviteId);

            if (!result) {
                res.status(404).json({ error: 'Invite not found' });
                return;
            }

            res.json({ message: 'Invite revoked successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get institution user count (for checking limits)
    async getInstitutionUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { institutionId } = req.params;

            const institution = await Institution.findById(institutionId);
            if (!institution) {
                res.status(404).json({ error: 'Institution not found' });
                return;
            }

            const users = await User.find({ institution: institutionId })
                .select('firstName lastName email role isActive createdAt');

            res.json({
                institution: {
                    id: institution._id,
                    name: institution.name,
                    maxUsers: institution.maxUsers
                },
                currentCount: users.length,
                remainingSlots: institution.maxUsers - users.length,
                users
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const inviteController = new InviteController();
