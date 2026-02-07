import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/register/candidate', authController.registerCandidate);
router.post('/register/employer', authController.registerEmployer.bind(authController));
router.post('/set-password', authController.setPassword);

export default router;
