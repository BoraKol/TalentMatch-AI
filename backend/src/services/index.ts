
import { IUser } from '../models/user.model';
import User from '../models/user.model';
import { IEmployer } from '../models/employer.model';
import Employer from '../models/employer.model';
import { IInstitution } from '../models/institution.model';
import Institution from '../models/institution.model';
import { BaseService } from './base.service';

export const userService = new BaseService<IUser>(User);

import { candidateService } from './candidate.service';
export { candidateService };

export const employerService = new BaseService<IEmployer>(Employer);
export const institutionService = new BaseService<IInstitution>(Institution);

// Only import services that actually exist
import { analyticsService } from './analytics.service';
import { aiMatchingService } from './ai-matching.service';
import emailService from './email.service';
import { authService } from './auth.service';
import { jobDiscoveryService } from './job-discovery.service';

// Add others if found: application, testimonial
import { applicationService } from './application.service';
import { testimonialService } from './testimonial.service';

export {
    analyticsService,
    aiMatchingService,
    emailService,
    authService,
    applicationService, // Assuming these exist based on list_dir
    testimonialService,
    jobDiscoveryService
};

export * from './strategies/matching.strategy';
