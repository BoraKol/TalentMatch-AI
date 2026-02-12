import { BaseController } from './base.controller';
import {
    userService, candidateService, employerService,
    institutionService,
    analyticsService,
    authService,
    applicationService,
    testimonialService,
    jobDiscoveryService
} from '../services';

export const userController = new BaseController(userService);
export const candidateController = new BaseController(candidateService);
export const employerController = new BaseController(employerService);
export const institutionController = new BaseController(institutionService);

// Only export controllers that actually exist
export * from './referral.controller';
export * from './auth.controller';
// export * from './job.controller'; // Does not exist
export * from './analytics.controller';
export * from './job-discovery.controller';
export * from './settings.controller';
export * from './admin-invite.controller';
export * from './application.controller';
export * from './candidate.controller';
export * from './custom.controller';
export * from './employer.controller';
export * from './health.controller';
export * from './institution.controller';
export * from './seed.controller';
export * from './testimonial.controller';
