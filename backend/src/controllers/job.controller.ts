import { Request, Response } from 'express';
import { jobService } from '../services/job.service';
import { BaseController } from './base.controller';

export class JobController extends BaseController {

    // GET my jobs (authenticated user's jobs)
    async getMyJobs(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const jobs = await jobService.getMyJobs(userId);
            this.sendSuccess(res, jobs);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // GET all jobs
    async getAllJobs(req: Request, res: Response) {
        try {
            const jobs = await jobService.getAllJobs();
            this.sendSuccess(res, jobs);
        } catch (error: any) {
            this.sendError(res, error.message);
        }
    }

    // GET single job by ID
    async getJobById(req: Request, res: Response) {
        try {
            const job = await jobService.getJobById(req.params.id);
            this.sendSuccess(res, job);
        } catch (error: any) {
            const status = error.message === 'Job not found' ? 404 : 500;
            this.sendError(res, error.message, status);
        }
    }

    // POST create new job
    async createJob(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const job = await jobService.createJob(req.body, userId);
            this.sendSuccess(res, job, 'Job created successfully', 201);
        } catch (error: any) {
            console.error('Create Job Error:', error);
            this.sendError(res, error.message, 400);
        }
    }

    // PUT update job
    async updateJob(req: Request, res: Response) {
        try {
            const job = await jobService.updateJob(req.params.id, req.body);
            this.sendSuccess(res, job);
        } catch (error: any) {
            const status = error.message === 'Job not found' ? 404 : 400;
            this.sendError(res, error.message, status);
        }
    }

    // DELETE job (soft delete)
    async deleteJob(req: Request, res: Response) {
        try {
            const result = await jobService.deleteJob(req.params.id);
            this.sendSuccess(res, result);
        } catch (error: any) {
            const status = error.message === 'Job not found' ? 404 : 500;
            this.sendError(res, error.message, status);
        }
    }
}

export const jobController = new JobController();
