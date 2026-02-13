import { Router, Request, Response } from 'express';
import { adminController } from '../controllers/admin.controller';
import { inviteController } from '../controllers/admin-invite.controller';
import { authMiddleware, superAdminMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Routes requiring super_admin ONLY
router.get('/pending-validations', authMiddleware, superAdminMiddleware, adminController.getPendingValidations.bind(adminController));
router.post('/approve-institution/:id', authMiddleware, superAdminMiddleware, adminController.approveInstitution.bind(adminController));
router.post('/approve-employer/:id', authMiddleware, superAdminMiddleware, adminController.approveEmployer.bind(adminController));
router.post('/reject', authMiddleware, superAdminMiddleware, adminController.rejectValidation.bind(adminController));

// Invitation management - allowed for super_admin OR institution_admin
const institutionAdminMiddleware = requireRole('super_admin', 'institution_admin');

router.post('/invite', authMiddleware, institutionAdminMiddleware, (req, res) => inviteController.sendInvite(req, res));
router.get('/invites', authMiddleware, institutionAdminMiddleware, (req, res) => inviteController.getPendingInvites(req, res));
router.delete('/invites/:inviteId', authMiddleware, institutionAdminMiddleware, (req, res) => inviteController.revokeInvite(req, res));

// Institution-specific user management
router.get('/institution/users', authMiddleware, institutionAdminMiddleware, (req, res) => inviteController.getInstitutionUsers(req, res));
router.get('/institutions/:institutionId/users', authMiddleware, superAdminMiddleware, (req, res) => inviteController.getInstitutionUsers(req, res));

export default router;

