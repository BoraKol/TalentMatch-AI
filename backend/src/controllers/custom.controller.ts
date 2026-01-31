import { Request, Response } from 'express';
import { candidateService } from '../services'; // New BaseService instance
import emailService from '../services/email.service';
import logger from '../utils/logger';

export const inviteCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { jobTitle } = req.body;

        const candidate = await candidateService.findById(id);
        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        if (!candidate.email) {
            // @ts-ignore
            console.warn(`Candidate ${candidate.firstName} ${candidate.lastName} missing email. Using test address.`);
            // @ts-ignore
            candidate.email = 'test-candidate@ethereal.email';
        }

        const info = await emailService.sendInterviewInvite(candidate.email, `${candidate.firstName} ${candidate.lastName}`, jobTitle || 'Open Position');

        res.status(200).json({ message: 'Invitation sent successfully', info });
    } catch (error: any) {
        logger.error(error.message);
        res.status(500).json({ message: 'Error sending invitation' });
    }
};
