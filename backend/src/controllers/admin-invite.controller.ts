import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import AdminInvite from '../models/admin-invite.model';
import User from '../models/user.model';

export class AdminInviteController {

    // Send invite to new super admin (only existing super admin can do this)
    async sendInvite(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const inviterId = (req as any).user?.id;

            if (!email) {
                res.status(400).json({ error: 'Email is required' });
                return;
            }

            // Check if email already exists as user
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: 'User with this email already exists' });
                return;
            }

            // Check for existing pending invite
            const existingInvite = await AdminInvite.findOne({
                email,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });
            if (existingInvite) {
                res.status(400).json({ error: 'An active invite already exists for this email' });
                return;
            }

            // Generate secure token
            const token = crypto.randomBytes(32).toString('hex');

            // Create invite (expires in 7 days)
            const invite = await AdminInvite.create({
                email,
                token,
                invitedBy: inviterId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            // In production, send email here
            // For now, return the invite link
            const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/admin/accept-invite/${token}`;

            res.status(201).json({
                message: 'Invite sent successfully',
                inviteLink, // Remove in production, send via email instead
                expiresAt: invite.expiresAt
            });

        } catch (error: any) {
            console.error('Send Invite Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all pending invites
    async getPendingInvites(req: Request, res: Response): Promise<void> {
        try {
            const invites = await AdminInvite.find({
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            })
                .populate('invitedBy', 'firstName lastName email')
                .sort({ createdAt: -1 });

            res.json(invites);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Verify invite token (public endpoint)
    async verifyInvite(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params;

            const invite = await AdminInvite.findOne({
                token,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });

            if (!invite) {
                res.status(404).json({ error: 'Invalid or expired invite' });
                return;
            }

            res.json({
                valid: true,
                email: invite.email,
                expiresAt: invite.expiresAt
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Accept invite and create super admin account
    async acceptInvite(req: Request, res: Response): Promise<void> {
        try {
            const { token, firstName, lastName, password } = req.body;

            if (!token || !firstName || !lastName || !password) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }

            // Find valid invite
            const invite = await AdminInvite.findOne({
                token,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });

            if (!invite) {
                res.status(404).json({ error: 'Invalid or expired invite' });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create super admin user
            const user = await User.create({
                email: invite.email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'super_admin',
                isActive: true
            });

            // Mark invite as used
            invite.usedAt = new Date();
            await invite.save();

            res.status(201).json({
                message: 'Super Admin account created successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });

        } catch (error: any) {
            console.error('Accept Invite Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Revoke/Cancel an invite
    async revokeInvite(req: Request, res: Response): Promise<void> {
        try {
            const { inviteId } = req.params;

            const result = await AdminInvite.findByIdAndDelete(inviteId);

            if (!result) {
                res.status(404).json({ error: 'Invite not found' });
                return;
            }

            res.json({ message: 'Invite revoked successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const adminInviteController = new AdminInviteController();
