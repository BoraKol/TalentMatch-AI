
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import User from '../models/user.model';
import Candidate from '../models/candidate.model';
import Employer from '../models/employer.model';
import Institution from '../models/institution.model';
import Invite from '../models/admin-invite.model';
import { config } from '../config';

import {
    LoginSchema,
    RegisterCandidateSchema,
    RegisterEmployerSchema,
    RegisterInstitutionSchema,
    SetPasswordSchema
} from '../validators/auth.validator';

export class AuthService {

    async login(email: string, password?: string) {
        // Validation
        await LoginSchema.parseAsync({ email, password });

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            const error = new Error('Account is inactive. Please contact admin or check email.');
            (error as any).statusCode = 403;
            throw error;
        }

        const isMatch = await comparePassword(password || '', user.password || '');
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        await user.populate('institution');
        const institution = user.institution as any;

        return {
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
        };
    }

    async registerCandidate(data: any) {
        // Validation
        const validated = await RegisterCandidateSchema.parseAsync(data);
        const { email, password, firstName, lastName, region, country, school, department, skills } = validated;

        const existing = await User.findOne({ email });
        if (existing) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'candidate',
            isActive: true
        });

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

        return { message: 'Candidate registered successfully' };
    }

    async registerEmployer(data: any) {
        // Validation
        const validated = await RegisterEmployerSchema.parseAsync(data);
        const { email, password, firstName, lastName, companyName, companyWebsite, industry, institutionId } = validated;

        const institution = await Institution.findById(institutionId);
        if (!institution) {
            throw new Error('Selected institution not found.');
        }
        if (institution.status !== 'active') {
            throw new Error('Selected institution is not active.');
        }

        const existing = await User.findOne({ email });
        if (existing) {
            throw new Error('Email already exists');
        }

        const userCount = await User.countDocuments({ institution: institution._id });
        if (userCount >= (institution.maxUsers || 5)) {
            throw new Error(`Institution has reached maximum user limit (${institution.maxUsers || 5})`);
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'employer',
            isActive: true,
            institution: institution._id
        });

        await Employer.create({
            user: user._id,
            institution: institution._id,
            name: companyName || `${firstName} ${lastName}`,
            industry: industry || '',
            website: companyWebsite || '',
            contactEmail: email
        });

        return {
            message: 'Employer registered successfully',
            institutionId: institution._id,
            institutionName: institution.name
        };
    }

    async registerInstitution(data: any) {
        // Validation
        const validated = await RegisterInstitutionSchema.parseAsync(data);
        const { email, password, firstName, lastName, institutionName, institutionType, emailDomain, website } = validated;

        if (config.publicEmailDomains.includes(emailDomain.toLowerCase())) {
            throw new Error('Public email domains (gmail, hotmail, etc.) cannot be used for institution registration. Please use your institutional email domain.');
        }

        const adminEmailDomain = email.split('@')[1];
        if (adminEmailDomain.toLowerCase() !== emailDomain.toLowerCase()) {
            throw new Error(`Your email domain (${adminEmailDomain}) must match the institution's email domain (${emailDomain}).`);
        }

        const existing = await User.findOne({ email });
        if (existing) {
            throw new Error('Email already exists');
        }

        const existingInstitution = await Institution.findOne({ emailDomain: emailDomain.toLowerCase() });
        if (existingInstitution) {
            throw new Error('An institution with this email domain already exists. Please contact your institution admin to get an invite.');
        }

        const hashedPassword = await hashPassword(password);

        const institution = await Institution.create({
            name: institutionName,
            institutionType: institutionType || 'university', // Using validated data which already defaults via enum/optional if we set defaults in schema, but here we keep optional
            emailDomain,
            adminEmail: email,
            website,
            maxUsers: 5,
            status: 'active'
        });

        await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'institution_admin',
            isActive: true,
            institution: institution._id
        });

        return {
            message: 'Institution registered successfully',
            institutionId: institution._id,
            remainingSlots: 4
        };
    }

    async setPassword(data: any) {
        // Validation
        const validated = await SetPasswordSchema.parseAsync(data);
        const { email, password, inviteToken } = validated;

        const invite = await Invite.findOne({
            email,
            token: inviteToken,
            expiresAt: { $gt: new Date() },
            usedAt: { $exists: false }
        });

        if (!invite) {
            const error = new Error('Invalid or expired invite token');
            (error as any).statusCode = 403;
            throw error;
        }

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            (error as any).statusCode = 404;
            throw error;
        }

        user.password = await hashPassword(password);
        user.isActive = true;
        await user.save();

        invite.usedAt = new Date();
        await invite.save();

        return { message: 'Password set successfully. You can now login.' };
    }
}

export const authService = new AuthService();
