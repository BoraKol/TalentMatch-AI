import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { institutionService } from '../services/institution.service';
import Institution from '../models/institution.model';
import User from '../models/user.model';
import nodemailer from 'nodemailer';
import { config } from '../config';

export class InstitutionController extends BaseController<any> {
    constructor() {
        super(institutionService);
    }

    // Override create to handle Admin Invite logic
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, emailDomain, adminEmail } = req.body;

            // 1. Create Institution
            const institution = await Institution.create(req.body);

            // 2. Check if Admin User exists, if not invite
            let user = await User.findOne({ email: adminEmail });
            if (!user) {
                // Determine invite link (frontend url)
                const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/set-password?email=${adminEmail}`;

                // create pending user or just send email?
                // For simplicity, we create a user with a temp password or status
                user = await User.create({
                    email: adminEmail,
                    role: 'institution_admin',
                    isActive: false // Waits for password set
                });

                // Send Email (Mocking logic here, standard nodemail)
                console.log(`[EMAIL] Sending Invite to ${adminEmail}: ${inviteLink}`);
            } else {
                // If user exists, maybe update role?
                user.role = 'institution_admin';
                await user.save();
            }

            res.status(201).json(institution);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export const institutionController = new InstitutionController();
