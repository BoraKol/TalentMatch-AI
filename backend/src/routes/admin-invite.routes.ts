import { Router } from 'express';
import { adminInviteController } from '../controllers/admin-invite.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require super_admin role)
router.post('/invite', authMiddleware, superAdminMiddleware, (req, res) => adminInviteController.sendInvite(req, res));
router.get('/invites', authMiddleware, superAdminMiddleware, (req, res) => adminInviteController.getPendingInvites(req, res));
router.delete('/invites/:inviteId', authMiddleware, superAdminMiddleware, (req, res) => adminInviteController.revokeInvite(req, res));

// Public routes (for invite acceptance)
router.get('/verify-invite/:token', (req, res) => adminInviteController.verifyInvite(req, res));
router.post('/accept-invite', (req, res) => adminInviteController.acceptInvite(req, res));

export default router;
