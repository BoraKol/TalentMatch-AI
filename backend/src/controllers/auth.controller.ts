import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import User from '../models/user.model';
import Candidate from '../models/candidate.model';
import Employer from '../models/employer.model';
import Institution from '../models/institution.model';
import Invite from '../models/admin-invite.model';
import { config } from '../config';

// --- Controller ---

export class AuthController {

    // Login for all roles
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

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
            const isMatch = await comparePassword(password, user.password || '');
            if (!isMatch) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Generate Token
            const token = generateToken({
                id: user._id,
                email: user.email,
                role: user.role
            });

            // Populate institution details if available
            await user.populate('institution');
            const institution = user.institution as any;

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    institutionId: institution?._id || user.institution,
                    companyName: institution?.name
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

            if (!email || !password || !firstName || !lastName) {
                res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
                return;
            }

            // Check existing
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Hash Password
            const hashedPassword = await hashPassword(password);

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

            res.status(201).json({ message: 'Candidate registered successfully' });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Register Employer (linked to an Institution)
    async registerEmployer(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, companyName, companyWebsite, industry, institutionId } = req.body;

            // Require institutionId
            if (!institutionId) {
                res.status(400).json({ error: 'Institution selection is required. Please select the institution you belong to.' });
                return;
            }

            // Validate institution exists and is active
            const institution = await Institution.findById(institutionId);
            if (!institution) {
                res.status(400).json({ error: 'Selected institution not found.' });
                return;
            }
            if (institution.status !== 'active') {
                res.status(400).json({ error: 'Selected institution is not active.' });
                return;
            }

            // Check existing User
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Check 5-user limit for institution
            const userCount = await User.countDocuments({ institution: institution._id });
            if (userCount >= (institution.maxUsers || 5)) {
                res.status(400).json({ error: `Institution has reached maximum user limit (${institution.maxUsers || 5})` });
                return;
            }

            // Hash Password
            const hashedPassword = await hashPassword(password);

            // Create User with employer role
            const user = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'employer',
                isActive: true,
                institution: institution._id
            });

            // Create Employer record linked to institution
            await Employer.create({
                user: user._id,
                institution: institution._id,
                name: companyName || `${firstName} ${lastName}`,
                industry: industry || '',
                website: companyWebsite || '',
                contactEmail: email
            });

            res.status(201).json({
                message: 'Employer registered successfully',
                institutionId: institution._id,
                institutionName: institution.name
            });
        } catch (error: any) {
            console.error('Register Employer Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Register Institution (Public - creates new institution with admin)
    async registerInstitution(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, institutionName, institutionType, emailDomain, website } = req.body;

            // Validate public email domain (from centralized config)
            if (config.publicEmailDomains.includes(emailDomain.toLowerCase())) {
                res.status(400).json({
                    error: 'Public email domains (gmail, hotmail, etc.) cannot be used for institution registration. Please use your institutional email domain.'
                });
                return;
            }

            // Verify that admin email matches the institution's email domain
            const adminEmailDomain = email.split('@')[1];
            if (adminEmailDomain.toLowerCase() !== emailDomain.toLowerCase()) {
                res.status(400).json({
                    error: `Your email domain (${adminEmailDomain}) must match the institution's email domain (${emailDomain}).`
                });
                return;
            }

            // Check existing User
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }

            // Check if institution with this email domain already exists
            const existingInstitution = await Institution.findOne({ emailDomain: emailDomain.toLowerCase() });
            if (existingInstitution) {
                res.status(400).json({ error: 'An institution with this email domain already exists. Please contact your institution admin to get an invite.' });
                return;
            }

            // Hash Password
            const hashedPassword = await hashPassword(password);

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
            await User.create({
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
                remainingSlots: 4
            });
        } catch (error: any) {
            console.error('Register Institution Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Set Password (for Invitation flow — VALIDATES invite token)
    async setPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, inviteToken } = req.body;

            if (!email || !password || !inviteToken) {
                res.status(400).json({ error: 'Email, password, and inviteToken are required' });
                return;
            }

            // Verify invite token against DB
            const invite = await Invite.findOne({
                email,
                token: inviteToken,
                expiresAt: { $gt: new Date() },
                usedAt: { $exists: false }
            });

            if (!invite) {
                res.status(403).json({ error: 'Invalid or expired invite token' });
                return;
            }

            const user = await User.findOne({ email });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Hash new password
            user.password = await hashPassword(password);
            user.isActive = true;
            await user.save();

            // Mark invite as used
            invite.usedAt = new Date();
            await invite.save();

            res.json({ message: 'Password set successfully. You can now login.' });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const authController = new AuthController();
