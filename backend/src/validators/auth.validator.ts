
import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

export const RegisterCandidateSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    region: z.string().optional(),
    country: z.string().optional(),
    school: z.string().optional(),
    department: z.string().optional(),
    skills: z.array(z.string()).optional()
});

export const RegisterEmployerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    companyName: z.string().optional(),
    companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
    industry: z.string().optional(),
    institutionId: z.string().min(1, 'Institution selection is required')
});

export const RegisterInstitutionSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    institutionName: z.string().min(2, 'Institution name is too short'),
    institutionType: z.enum(['university', 'company', 'certification_body']).optional(),
    emailDomain: z.string().min(2, 'Email domain is required'),
    website: z.string().url('Invalid URL').optional().or(z.literal(''))
});

export const SetPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    inviteToken: z.string().min(1, 'Invite token is required')
});
