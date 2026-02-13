import { Response } from 'express';
import { AuthRequest } from '../types/express';
import User from '../models/user.model';
import Job from '../models/job.model';
import Candidate from '../models/candidate.model';
import Institution, { IInstitution } from '../models/institution.model';
import Employer from '../models/employer.model';
import Application from '../models/application.model';
import { BaseController } from './base.controller';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController extends BaseController {
    constructor() {
        super();
    }

    // Institution Dashboard Stats
    async getInstitutionStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const user = await User.findById(userId);

            if (!user?.institution) {
                this.sendError(res, 'No institution linked to this user', 400);
                return;
            }

            const institutionId = user.institution;

            // 1. Get Institution Users IDs directly (for job query)
            const institutionUsers = await User.find({ institution: institutionId }).select('_id');
            const institutionUserIds = institutionUsers.map(u => u._id);

            // 2. Parallel Count Queries
            const [userCount, jobCount, candidateCount, employerCount, institution] = await Promise.all([
                User.countDocuments({ institution: institutionId }),
                Job.countDocuments({ postedBy: { $in: institutionUserIds } }),
                Candidate.countDocuments({ institution: institutionId.toString() }),
                Employer.countDocuments({ institution: institutionId }),
                Institution.findById(institutionId)
            ]);

            this.sendSuccess(res, {
                userCount,
                maxUsers: institution?.maxUsers || 5,
                jobCount,
                candidateCount,
                employerCount,
                institutionName: institution?.name,
                institutionStatus: institution?.status,
                remainingSlots: Math.max(0, (institution?.maxUsers || 5) - userCount)
            });
        } catch (error: any) {
            console.error('Institution Stats Error:', error);
            this.sendError(res, error.message);
        }
    }

    // Employer Dashboard Stats
    async getEmployerStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            // Get jobs posted by this employer
            const jobs = await Job.find({ postedBy: userId });
            const jobIds = jobs.map(j => j._id);

            // Get application/match stats
            const [totalApplications, hiredCount] = await Promise.all([
                Application.countDocuments({ job: { $in: jobIds } }),
                Application.countDocuments({ job: { $in: jobIds }, status: 'hired' })
            ]);

            // Get user's institution info
            const user = await User.findById(userId).populate<{ institution: IInstitution }>('institution');

            this.sendSuccess(res, {
                activeJobs: jobs.filter(j => j.isActive).length,
                totalJobs: jobs.length,
                totalApplications,
                hiredCount,
                matchRate: totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0,
                institutionName: user?.institution?.name || 'Independent',
                institutionId: user?.institution?._id || null
            });
        } catch (error: any) {
            console.error('Employer Stats Error:', error);
            this.sendError(res, error.message);
        }
    }

    // Super Admin Overview Stats
    async getAdminStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const [
                totalInstitutions,
                activeInstitutions,
                totalEmployers,
                totalCandidates,
                totalJobs,
                totalApplications,
                recentRegistrations,
                advancedAnalytics
            ] = await Promise.all([
                Institution.countDocuments(),
                Institution.countDocuments({ status: 'active' }),
                User.countDocuments({ role: 'employer' }),
                User.countDocuments({ role: 'candidate' }),
                Job.countDocuments(),
                Application.countDocuments(),
                User.find()
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .select('email firstName lastName role institution createdAt')
                    .populate<{ institution: IInstitution }>('institution', 'name'),
                analyticsService.getSuperAdminAnalytics()
            ]);

            this.sendSuccess(res, {
                totalInstitutions,
                activeInstitutions,
                totalEmployers,
                totalCandidates,
                totalJobs,
                totalApplications,
                recentRegistrations: recentRegistrations.map(u => ({
                    id: u._id,
                    email: u.email,
                    name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                    role: u.role,
                    institutionName: u.institution?.name || null,
                    registeredAt: u.createdAt
                })),
                advanced: advancedAnalytics
            });
        } catch (error: any) {
            console.error('Admin Stats Error:', error);
            this.sendError(res, error.message);
        }
    }

    // General Dashboard Metrics (for /analytics/dashboard for Super Admin)
    async getDashboardMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const metrics = await analyticsService.getDashboardMetrics();
            this.sendSuccess(res, metrics);
        } catch (error: any) {
            console.error('Dashboard Metrics Error:', error);
            this.sendError(res, error.message);
        }
    }

    // Get list of all institutions (for employer registration dropdown)
    async getActiveInstitutions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const institutions = await Institution.find({ status: 'active' })
                .select('name emailDomain institutionType')
                .sort({ name: 1 });

            this.sendSuccess(res, institutions);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }
}

export const analyticsController = new AnalyticsController();
