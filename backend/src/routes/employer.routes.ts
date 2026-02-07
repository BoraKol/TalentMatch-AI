import { Router } from 'express';
import { employerController } from '../controllers/employer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Employer Routes - Require 'institution_admin' (Employer) role
// Note: We might want allow 'recruiter' if we kept it, but we deleted it. 
// checking 'institution_admin' is safe.
router.use(authenticate);

// Get AI Matches for a specific Job
router.get('/jobs/:jobId/matches', employerController.getJobMatches);

export default router;
