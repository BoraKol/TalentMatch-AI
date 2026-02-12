import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { inviteService, InviteService } from '../services/invite.service';
import { BaseController } from './base.controller';

export class InviteController extends BaseController {
    private inviteService: InviteService;

    constructor() {
        super();
        this.inviteService = inviteService;
    }

    // Send invite (Super Admin can invite all types)
    async sendInvite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { email, inviteType, institutionId } = req.body;
            const inviterId = req.user?.id;

            if (!email || !inviteType) {
                this.sendError(res, 'Email and inviteType are required', 400);
                return;
            }

            const result = await this.inviteService.sendInvite({
                email,
                inviteType,
                institutionId,
                inviterId
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
            const invites = await this.inviteService.getPendingInvites(type as string);
            this.sendSuccess(res, invites);
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
            const { institutionId } = req.params;
            // This logic might be better in a separate InstitutionService/Controller, 
            // but keeping it here as it was original.
            // For now, let's keep it simple as it's a "get" operation.
            // In a full refactor, this moves to InstitutionService.
            const result = await this.inviteService.getInstitutionUsers(institutionId);
            this.sendSuccess(res, result);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }
}

export const inviteController = new InviteController();

