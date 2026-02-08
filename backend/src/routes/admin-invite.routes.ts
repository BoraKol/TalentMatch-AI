import { Router } from 'express';
import { inviteController } from '../controllers/admin-invite.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require super_admin role)
router.post('/invite', authMiddleware, superAdminMiddleware, (req, res) => inviteController.sendInvite(req, res));
router.get('/invites', authMiddleware, superAdminMiddleware, (req, res) => inviteController.getPendingInvites(req, res));
router.delete('/invites/:inviteId', authMiddleware, superAdminMiddleware, (req, res) => inviteController.revokeInvite(req, res));
router.get('/institutions/:institutionId/users', authMiddleware, superAdminMiddleware, (req, res) => inviteController.getInstitutionUsers(req, res));

// Public routes (for invite acceptance)
router.get('/verify-invite/:token', (req, res) => inviteController.verifyInvite(req, res));
router.post('/accept-invite', (req, res) => inviteController.acceptInvite(req, res));

export default router;
