import { Request, Response } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { BaseController } from './base.controller';

export class AuthController extends BaseController {
    private authService: AuthService;

    constructor() {
        super();
        this.authService = authService;
    }

    // Login for all roles
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            this.sendSuccess(res, result, 'Login successful');
        } catch (error: any) {
            const status = error.statusCode || 401;
            this.sendError(res, error.message, status);
        }
    }

    // Register Candidate (Public)
    async registerCandidate(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.registerCandidate(req.body);
            this.sendSuccess(res, result, 'Candidate registered successfully', 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Register Employer (linked to an Institution)
    async registerEmployer(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.registerEmployer(req.body);
            this.sendSuccess(res, result, 'Employer registered successfully', 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Register Institution (Public - creates new institution with admin)
    async registerInstitution(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.registerInstitution(req.body);
            this.sendSuccess(res, result, 'Institution registered successfully', 201);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Set Password (for Invitation flow — VALIDATES invite token)
    async setPassword(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.setPassword(req.body);
            this.sendSuccess(res, result, 'Password set successfully');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }
}

export const authController = new AuthController();

