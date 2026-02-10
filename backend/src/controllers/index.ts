import { BaseController } from './base.controller';
import {
    userService, candidateService, employerService,
    institutionService, schoolService, departmentService, programService,
    employerReferralInvitationService, candidateReferralInvitationService, notificationService
} from '../services';

export const userController = new BaseController(userService);
export const candidateController = new BaseController(candidateService);
export const employerController = new BaseController(employerService);

export const institutionController = new BaseController(institutionService);
export const schoolController = new BaseController(schoolService);
export const departmentController = new BaseController(departmentService);
export const programController = new BaseController(programService);
export const employerReferralInvitationController = new BaseController(employerReferralInvitationService);
export const candidateReferralInvitationController = new BaseController(candidateReferralInvitationService);
export const notificationController = new BaseController(notificationService);
