import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { inviteController } from '../controllers/admin-invite.controller';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * /auth/register/candidate:
 *   post:
 *     summary: Register a new Candidate
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidate registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register/candidate', authController.registerCandidate.bind(authController));
router.post('/register/employer', authController.registerEmployer.bind(authController));
router.post('/register/institution', authController.registerInstitution.bind(authController));
router.post('/set-password', authController.setPassword.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Public invitation routes
router.get('/verify-invite/:token', (req, res) => inviteController.verifyInvite(req, res));
router.post('/accept-invite', (req, res) => inviteController.acceptInvite(req, res));

export default router;
