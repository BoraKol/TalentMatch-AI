import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { inviteController } from '../controllers/admin-invite.controller';

const router = Router();

router.post('/login', authController.login.bind(authController));
router.post('/register/candidate', authController.registerCandidate.bind(authController));
router.post('/register/employer', authController.registerEmployer.bind(authController));
router.post('/register/institution', authController.registerInstitution.bind(authController));
router.post('/set-password', authController.setPassword.bind(authController));

// Public invitation routes
router.get('/verify-invite/:token', (req, res) => inviteController.verifyInvite(req, res));
router.post('/accept-invite', (req, res) => inviteController.acceptInvite(req, res));

export default router;

