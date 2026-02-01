import { Router } from 'express';
import candidateRoutes from './candidate.routes';
import jobRoutes from './job.routes';
import userRoutes from './user.routes';
import institutionRoutes from './institution.routes';
import testimonialRoutes from './testimonial.routes';
import settingsRoutes from './settings.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingsRoutes);

export default router;
