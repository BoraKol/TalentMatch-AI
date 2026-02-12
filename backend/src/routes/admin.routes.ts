import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { inviteController } from '../controllers/admin-invite.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require super_admin role)
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/pending-validations', adminController.getPendingValidations.bind(adminController));
router.post('/approve-institution/:id', adminController.approveInstitution.bind(adminController));
router.post('/approve-employer/:id', adminController.approveEmployer.bind(adminController));
router.post('/reject', adminController.rejectValidation.bind(adminController));

// Invitation management
router.post('/invite', (req, res) => inviteController.sendInvite(req, res));
router.get('/invites', (req, res) => inviteController.getPendingInvites(req, res));
router.delete('/invites/:inviteId', (req, res) => inviteController.revokeInvite(req, res));
router.get('/institutions/:institutionId/users', (req, res) => inviteController.getInstitutionUsers(req, res));

// Note: Public routes for verify/accept should stay in a public-accessible router 
// or be moved to auth/public routes specifically. 
// For now, I'll put them in auth.routes or a separate public file if they shouldn't be here.
// Actually, since they were at /api/admin/verify-invite, I'll put them in a public section here.

export default router;

