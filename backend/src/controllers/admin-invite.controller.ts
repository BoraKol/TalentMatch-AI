import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { inviteService, InviteService } from '../services/invite.service';
import { BaseController } from './base.controller';
import User from '../models/user.model';

export class InviteController extends BaseController {
    private inviteService: InviteService;

    constructor() {
        super();
        this.inviteService = inviteService;
    }

    // Send invite (Super Admin can invite all types)
    async sendInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            let { email, inviteType, institutionId } = req.body;
            const user = req.user;

            if (!email || !inviteType) {
                this.sendError(res, 'Email and inviteType are required', 400);
                return;
            }

            // If institution_admin, force their institutionId
            if (user?.role === 'institution_admin') {
                const dbUser = await User.findById(user.id);
                if (!dbUser?.institution) {
                    this.sendError(res, 'User is not linked to an institution', 403);
                    return;
                }
                institutionId = dbUser.institution.toString();
                inviteType = 'employer'; // For simplicity in this flow, or keep as requested if logic allows
            }

            const result = await this.inviteService.sendInvite({
                email,
                inviteType,
                institutionId,
                inviterId: user?.id
            });

            this.sendSuccess(res, result, 'Invite sent successfully', 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Get pending invites (optionally filter by type)
    async getPendingInvites(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { type } = req.query;
            const user = req.user;
            let filterInstitutionId = undefined;

            if (user?.role === 'institution_admin') {
                const dbUser = await User.findById(user.id);
                filterInstitutionId = dbUser?.institution?.toString();
            }

            const invites = await this.inviteService.getPendingInvites(type as string, filterInstitutionId);
            this.sendSuccess(res, { invites });
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Verify invite token (public endpoint)
    async verifyInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { token } = req.params;
            const result = await this.inviteService.verifyInvite(token);
            this.sendSuccess(res, result);
        } catch (error: any) {
            this.sendError(res, error.message, 404);
        }
    }

    // Accept invite and create account based on type
    async acceptInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { token, firstName, lastName, password, ...additionalData } = req.body;

            if (!token || !firstName || !lastName || !password) {
                this.sendError(res, 'Token, firstName, lastName, and password are required', 400);
                return;
            }

            const result = await this.inviteService.acceptInvite({
                token,
                firstName,
                lastName,
                password,
                additionalData
            });

            this.sendSuccess(res, result, result.message, 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Revoke/Cancel an invite
    async revokeInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { inviteId } = req.params;
            const result = await this.inviteService.revokeInvite(inviteId);

            if (!result) {
                this.sendError(res, 'Invite not found', 404);
                return;
            }

            this.sendSuccess(res, null, 'Invite revoked successfully');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Get institution user count (for checking limits)
    async getInstitutionUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            let { institutionId } = req.params;
            const user = req.user;

            // If no ID provided or if caller is institution_admin, resolve from session
            if (!institutionId || user?.role === 'institution_admin') {
                const dbUser = await User.findById(user?.id);
                if (!dbUser?.institution) {
                    this.sendError(res, 'No institution found for this user', 404);
                    return;
                }
                institutionId = dbUser.institution.toString();
            }

            const result = await this.inviteService.getInstitutionUsers(institutionId);
            this.sendSuccess(res, result);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }
}

export const inviteController = new InviteController();

