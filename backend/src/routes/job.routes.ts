import { Router, Request, Response } from 'express';
import Job from '../models/job.model';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET my jobs (authenticated user's jobs)
router.get('/my-jobs', authenticate, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const jobs = await Job.find({ postedBy: userId, isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET all jobs
router.get('/', async (req: Request, res: Response) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET single job by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new job
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            company,
            location,
            salaryRange,
            requirements,
            requiredSkills,
            preferredSkills,
            employmentType,
            experienceRequired
        } = req.body;

        // @ts-ignore
        const postedBy = req.user.id;

        const job = await Job.create({
            title,
            description,
            company,
            location,
            salaryRange,
            requirements: requirements || requiredSkills || [],
            requiredSkills: requiredSkills || [],
            preferredSkills: preferredSkills || [],
            employmentType: employmentType || 'Full-time',
            experienceRequired: experienceRequired || 0,
            postedBy,
            isActive: true
        });

        res.status(201).json(job);
    } catch (error: any) {
        console.error('Create Job Error:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT update job
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE job (soft delete - set isActive to false)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

