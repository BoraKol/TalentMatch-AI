import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, AuthUser } from '../types/express';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    // @ts-ignore
    const token = (req as any).cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Alias for cleaner imports
export const authMiddleware = authenticate;

// Factory: role-based middleware
export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Convenience alias (kept for backward compat)
export const superAdminMiddleware = requireRole('super_admin');
