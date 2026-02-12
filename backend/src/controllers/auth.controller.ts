import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ZodError } from 'zod';

export class AuthController {

    private handleError(res: Response, error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: 'Validation Error', details: error.errors });
        }

        const status = error.statusCode || 400; // Default to 400 for bad request/validation logic errors
        const message = error.message || 'Internal Server Error';

        // Specific handling for known auth errors if needed, otherwise generic
        if (status === 500) {
            console.error('Internal Auth Error:', error);
        }

        res.status(status).json({ error: message });
    }

    // Login for all roles
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            // Login specific: default to 401/403
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.errors });
            } else {
                const status = error.statusCode || 401;
                res.status(status).json({ error: error.message });
            }
        }
    }

    // Register Candidate (Public)
    async registerCandidate(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.registerCandidate(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    // Register Employer (linked to an Institution)
    async registerEmployer(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.registerEmployer(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    // Register Institution (Public - creates new institution with admin)
    async registerInstitution(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.registerInstitution(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    // Set Password (for Invitation flow — VALIDATES invite token)
    async setPassword(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.setPassword(req.body);
            res.json(result);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }
}

export const authController = new AuthController();
