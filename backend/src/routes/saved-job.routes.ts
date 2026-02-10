import { Router } from 'express';
import { Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/express';
import SavedJob from '../models/saved-job.model';
import Candidate from '../models/candidate.model';

const router = Router();

router.use(authenticate);

// Save a job
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

        const { jobId } = req.body;
        if (!jobId) return res.status(400).json({ error: 'jobId is required' });

        const savedJob = new SavedJob({
            candidate: candidate._id,
            job: jobId
        });

        await savedJob.save();
        res.status(201).json({ message: 'Job saved successfully', savedJob });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Job already saved' });
        }
        res.status(500).json({ error: error.message || 'Failed to save job' });
    }
});

// Get saved jobs
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

        const savedJobs = await SavedJob.find({ candidate: candidate._id })
            .populate('job', 'title company location employmentType salaryRange requiredSkills preferredSkills experienceRequired description isActive createdAt')
            .sort({ savedAt: -1 });

        res.json(savedJobs);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to get saved jobs' });
    }
});

// Remove saved job
router.delete('/:jobId', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) return res.status(404).json({ error: 'Candidate profile not found' });

        const result = await SavedJob.findOneAndDelete({
            candidate: candidate._id,
            job: req.params.jobId
        });

        if (!result) return res.status(404).json({ error: 'Saved job not found' });

        res.json({ message: 'Job removed from saved list' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to remove saved job' });
    }
});

export default router;
