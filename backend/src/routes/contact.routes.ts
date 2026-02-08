import { Router, Request, Response } from 'express';
import emailService from '../services/email.service';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';

const router = Router();

// POST /api/contact/candidate - Send email to a candidate
router.post('/candidate', async (req: Request, res: Response) => {
    try {
        const {
            candidateId,
            jobId,
            subject,
            message,
            senderName,
            senderEmail,
            companyName
        } = req.body;

        // Debug Log
        console.log('📧 API: Received Contact Candidate Request:', { candidateId, jobId, subject, senderEmail });

        // Validate required fields
        if (!candidateId || !subject || !message || !senderName || !senderEmail || !companyName) {
            console.error('❌ API: Missing required fields:', req.body);
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch candidate
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Fetch job if provided
        let jobTitle = 'a position';
        if (jobId) {
            const job = await Job.findById(jobId);
            if (job) {
                jobTitle = job.title;
            }
        }

        // Send email
        const result = await emailService.sendContactEmail({
            to: candidate.email,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            subject,
            message,
            senderName,
            senderEmail,
            companyName,
            jobTitle
        });

        res.json({
            success: true,
            message: 'Email sent successfully',
            ...result
        });
    } catch (error: any) {
        console.error('Contact Candidate Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

export default router;
