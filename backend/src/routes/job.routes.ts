import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET my jobs (authenticated user's jobs)
router.get('/my-jobs', authenticate, jobController.getMyJobs.bind(jobController));

// GET all jobs
router.get('/', jobController.getAllJobs.bind(jobController));

// GET single job by ID
router.get('/:id', jobController.getJobById.bind(jobController));

// POST create new job
router.post('/', authenticate, jobController.createJob.bind(jobController));

// PUT update job
router.put('/:id', authenticate, jobController.updateJob.bind(jobController));

// DELETE job (soft delete)
router.delete('/:id', authenticate, jobController.deleteJob.bind(jobController));

export default router;
