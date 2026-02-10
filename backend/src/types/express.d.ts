import { Request } from 'express';

export interface AuthUser {
    id: string;
    email: string;
    role: 'super_admin' | 'institution_admin' | 'institution_user' | 'employer' | 'candidate';
    institutionId?: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}
