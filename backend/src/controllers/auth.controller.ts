import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import Candidate from '../models/candidate.model';
import { config } from '../config';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export class AuthController {

    // Login for all roles
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Check User
            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Check Active
            if (!user.isActive) {
                res.status(403).json({ error: 'Account is inactive. Please contact admin or check email.' });
                return;
            }

            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password || '');
            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Generate Token
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Populate institution details if available
            await user.populate('institution');

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    // @ts-ignore
                    companyName: user.institution?.name
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Register Candidate (Public)
    async registerCandidate(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, region, country, school, department, skills } = req.body;

            // Check existing
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User
            const user = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'candidate',
                isActive: true
            });

            // Create Candidate Profile
            await Candidate.create({
                user: user._id,
                firstName,
                lastName,
                email,
                region,
                country,
                school,
                department,
                skills: skills || []
            });

            // Auto-Login or just success
            res.status(201).json({ message: 'Candidate registered successfully' });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Register Employer (Institution Admin)
    async registerEmployer(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, companyName, companyWebsite, companyType } = req.body;

            // Check existing User
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Extract email domain
            const emailDomain = email.split('@')[1];

            // Check if institution with this domain already exists
            const Institution = require('../models/institution.model').default;
            let institution = await Institution.findOne({ emailDomain });

            // If institution doesn't exist, create a new one
            if (!institution) {
                institution = await Institution.create({
                    name: companyName,
                    type: companyType || 'Corporate',
                    emailDomain,
                    adminEmail: email,
                    website: companyWebsite,
                    status: 'active'
                });
            } else {
                // Check 5-user limit for existing institution
                const userCount = await User.countDocuments({ institution: institution._id });
                if (userCount >= (institution.maxUsers || 5)) {
                    res.status(400).json({ error: `Institution has reached maximum user limit (${institution.maxUsers || 5})` });
                    return;
                }
            }

            // Create User
            const user = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'institution_admin',
                isActive: true,
                institution: institution._id
            });

            res.status(201).json({ message: 'Employer registered successfully', institutionId: institution._id });
        } catch (error: any) {
            console.error('Register Employer Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Register Institution (Public - creates new institution with admin)
    async registerInstitution(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, institutionName, institutionType, emailDomain, website } = req.body;

            // Check existing User
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Check if institution with this email domain already exists
            const Institution = require('../models/institution.model').default;
            const existingInstitution = await Institution.findOne({ emailDomain });
            if (existingInstitution) {
                res.status(400).json({ error: 'An institution with this email domain already exists. Please contact your admin.' });
                return;
            }

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create Institution
            const institution = await Institution.create({
                name: institutionName,
                institutionType: institutionType || 'university',
                emailDomain,
                adminEmail: email,
                website,
                maxUsers: 5,
                status: 'active'
            });

            // Create User as institution_admin
            const user = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'institution_admin',
                isActive: true,
                institution: institution._id
            });

            res.status(201).json({
                message: 'Institution registered successfully',
                institutionId: institution._id,
                remainingSlots: 4 // Admin takes 1 of 5 slots
            });
        } catch (error: any) {
            console.error('Register Institution Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Set Password (for Invitation flow: Institution Admin, Recruiter)
    async setPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, inviteToken } = req.body;
            // In a real app, inviteToken would be verified against DB or JWT

            const user = await User.findOne({ email });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.isActive = true;
            await user.save();

            res.json({ message: 'Password set successfully. You can now login.' });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const authController = new AuthController();
