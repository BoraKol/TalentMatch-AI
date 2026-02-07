import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import Candidate from '../models/candidate.model';
import mongoose from 'mongoose';
import { config } from '../config';

export class CandidateController extends BaseController<any> {
    constructor() {
        super(Candidate as any); // Using generic or creating candidate service later
    }

    // Override or add specific methods
    // Override update to handle User sync
    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const candidateId = req.params.id;
            const updates = req.body;

            // Find candidate first to get user ID
            const candidate = await Candidate.findById(candidateId);
            if (!candidate) {
                res.status(404).json({ message: 'Candidate not found' });
                return;
            }

            // Update User model if name/email changed
            if (candidate.user && (updates.firstName || updates.lastName || updates.email)) {
                const userUpdates: any = {};
                if (updates.firstName) userUpdates.firstName = updates.firstName;
                if (updates.lastName) userUpdates.lastName = updates.lastName;
                // Email update logic (careful with auth) - allowing simple update for now
                if (updates.email) userUpdates.email = updates.email;

                const User = mongoose.model('User');
                await User.findByIdAndUpdate(candidate.user, userUpdates);
            }

            // Update Candidate model
            const updatedCandidate = await Candidate.findByIdAndUpdate(
                candidateId,
                { $set: updates },
                { new: true }
            );

            res.status(200).json(updatedCandidate);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getByUserId = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;
            const candidate = await Candidate.findOne({ user: userId }).populate('user', 'email');

            if (!candidate) {
                // Return 404 but maybe with a clear message or even empty object if that logic suits better
                // For now sticking to 404 as "Not Found"
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
