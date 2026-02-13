
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { institutionRepository, InstitutionRepository } from '../repositories/institution.repository';
import { userFactory, UserFactory } from './user-factory.service';
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
    private userRepo: UserRepository;
    private institutionRepo: InstitutionRepository;
    private factory: UserFactory;

    constructor() {
        this.userRepo = userRepository;
        this.institutionRepo = institutionRepository;
        this.factory = userFactory;
    }

    async login(email: string, password?: string) {
        await LoginSchema.parseAsync({ email, password });

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            const error = new Error('Your account is pending Super Admin approval. Please check back later.');
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
        const validated = await RegisterCandidateSchema.parseAsync(data);
        const { email, password, firstName, lastName, ...profileData } = validated;

        const existing = await this.userRepo.findByEmail(email);
        if (existing) {
            throw new Error('Email already exists');
        }

        const user = await this.factory.createUser({
            email,
            password,
            firstName,
            lastName,
            role: 'candidate',
            additionalData: profileData
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            message: 'Candidate registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }

    async registerEmployer(data: any) {
        const validated = await RegisterEmployerSchema.parseAsync(data);
        const { email, password, firstName, lastName, institutionId, ...companyData } = validated;

        const institution = await this.institutionRepo.findOne(institutionId);
        if (!institution) {
            throw new Error('Selected institution not found.');
        }
        if (institution.status !== 'active') {
            throw new Error('Selected institution is not active.');
        }

        const existing = await this.userRepo.findByEmail(email);
        if (existing) {
            throw new Error('Email already exists');
        }

        const userCount = await this.userRepo.count({ institution: institution._id });
        if (userCount >= (institution.maxUsers || 5)) {
            throw new Error(`Institution has reached maximum user limit (${institution.maxUsers || 5})`);
        }

        const user = await this.factory.createUser({
            email,
            password,
            firstName,
            lastName,
            role: 'employer',
            institutionId: institution._id.toString(),
            additionalData: companyData
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            message: 'Employer registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                institutionId: institution._id,
                companyName: institution.name
            }
        };
    }

    async registerInstitution(data: any) {
        const validated = await RegisterInstitutionSchema.parseAsync(data);
        const { email, password, firstName, lastName, institutionName, institutionType, emailDomain, website } = validated;

        if (config.publicEmailDomains.includes(emailDomain.toLowerCase())) {
            throw new Error('Public email domains cannot be used for institution registration.');
        }

        const adminEmailDomain = email.split('@')[1];
        if (adminEmailDomain.toLowerCase() !== emailDomain.toLowerCase()) {
            throw new Error(`Your email domain (${adminEmailDomain}) must match the institution's domain (${emailDomain}).`);
        }

        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        const existingInstitution = await this.institutionRepo.findByEmailDomain(emailDomain);
        if (existingInstitution) {
            throw new Error('An institution with this email domain already exists.');
        }

        const institution = await this.institutionRepo.create({
            name: institutionName,
            institutionType: (institutionType as any) || 'university',
            emailDomain,
            adminEmail: email,
            website,
            maxUsers: 5,
            status: 'pending'
        });

        const user = await this.factory.createUser({
            email,
            password,
            firstName,
            lastName,
            role: 'institution_admin',
            institutionId: institution._id.toString(),
            isActive: false
        });

        return {
            message: 'Institution registered successfully',
            institutionId: institution._id,
            remainingSlots: 4
        };
    }

    async setPassword(data: any) {
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

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            const error = new Error('User not found');
            (error as any).statusCode = 404;
            throw error;
        }

        const { hashPassword } = await import('../utils/password');
        user.password = await hashPassword(password);
        user.isActive = true;
        await user.save();

        invite.usedAt = new Date();
        await invite.save();

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            message: 'Password set successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }
}

export const authService = new AuthService();
