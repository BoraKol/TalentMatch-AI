import { Request, Response } from 'express';
import { CandidateService } from '../services/candidate.service';
import logger from '../utils/logger';

const candidateService = new CandidateService();
import emailService from '../services/email.service';

export const getCandidates = async (req: Request, res: Response) => {
    try {
        const candidates = await candidateService.getAllCandidates();
        res.status(200).json(candidates);
    } catch (error: any) {
        logger.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await candidateService.createCandidate(req.body);
        res.status(201).json(candidate);
    } catch (error: any) {
        logger.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const inviteCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { jobTitle } = req.body;

        const candidate = await candidateService.getCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (!candidate.email) {
            // Fallback for demo if data is missing email
            // return res.status(400).json({ message: 'Candidate does not have an email address' });
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
