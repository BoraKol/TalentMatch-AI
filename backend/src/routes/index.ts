import { Router } from 'express';
import candidateRoutes from './candidate.routes';
import jobRoutes from './job.routes';
import userRoutes from './user.routes';
import institutionRoutes from './institution.routes';
import testimonialRoutes from './testimonial.routes';
import settingsRoutes from './settings.routes';
import authRoutes from './auth.routes';
import employmentTypeRoutes from './employment-type.routes';
import skillRoutes from './skill.routes';
import analyticsRoutes from './analytics.routes';
import aiMatchingRoutes from './ai-matching.routes';
import contactRoutes from './contact.routes';
import applicationRoutes from './application.routes';
import employerRoutes from './employer.routes';
import jobDiscoveryRoutes from './job-discovery.routes';
import savedJobRoutes from './saved-job.routes';
import referralRoutes from './referral.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/candidates', candidateRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingsRoutes);
router.use('/employment-types', employmentTypeRoutes);
router.use('/skills', skillRoutes);

router.use('/ai-matching', aiMatchingRoutes);
router.use('/contact', contactRoutes);
router.use('/applications', applicationRoutes);
router.use('/employers', employerRoutes);
router.use('/job-discovery', jobDiscoveryRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/referrals', referralRoutes);
router.use('/analytics', analyticsRoutes);

export default router;


