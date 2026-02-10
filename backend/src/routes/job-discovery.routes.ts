import { Router } from 'express';
import { jobDiscoveryController } from '../controllers/job-discovery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Discover jobs with AI scoring
router.get('/discover', (req, res) => jobDiscoveryController.discoverJobs(req as any, res));

// Skill gap analysis
router.get('/skill-gaps', (req, res) => jobDiscoveryController.getSkillGaps(req as any, res));

export default router;
