import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import Candidate from '../models/candidate.model';
import { candidateService } from '../services/candidate.service';

export class CandidateController extends BaseController<any> {
    constructor() {
        super(Candidate as any);
    }

    // Override update to handle User sync via Service
    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const candidateId = req.params.id;
            const updates = req.body;

            const updatedCandidate = await candidateService.updateProfile(candidateId, updates);
            res.status(200).json(updatedCandidate);
        } catch (error: any) {
            if (error.message === 'Candidate not found') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    getByUserId = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;
            const candidate = await candidateService.getByUserId(userId);

            if (!candidate) {
                res.status(404).json({ message: 'Candidate profile not found' });
                return;
            }

            res.status(200).json(candidate);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const candidateController = new CandidateController();
