
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

            // Set cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            this.sendSuccess(res, { user: result.user }, 'Login successful');
        } catch (error: any) {
            const status = error.statusCode || 401;
            this.sendError(res, error.message, status);
        }
    }

    // Register Candidate (Public)
    async registerCandidate(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.registerCandidate(req.body);

            // Set cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            this.sendSuccess(res, { user: result.user }, 'Candidate registered successfully', 201);
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

            // Set cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            this.sendSuccess(res, { user: result.user }, 'Password set successfully');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie('token');
        this.sendSuccess(res, null, 'Logged out successfully');
    }

    // Forgot Password (Request Code)
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.forgotPassword(email);
            // Always return success
            this.sendSuccess(res, null, 'If an account exists, a verification code has been sent.');
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // Reset Password (Verify Code & Set New)
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.authService.resetPassword(req.body);
            this.sendSuccess(res, null, result.message);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }
}

export const authController = new AuthController();
