import { Router } from 'express';
import { createResourceRouter } from './resource.router';
import {
    userController, candidateController, employerController, referralPersonController,
    institutionController, schoolController, departmentController, programController,
    employerReferralInvitationController, candidateReferralInvitationController, notificationController
} from '../controllers';

const router = Router();

// Register all resource routes
router.use('/users', createResourceRouter(userController));
router.use('/candidates', createResourceRouter(candidateController));
router.use('/referralpersons', createResourceRouter(referralPersonController));
router.use('/employers', createResourceRouter(employerController));
router.use('/institutions', createResourceRouter(institutionController));
router.use('/schools', createResourceRouter(schoolController));
router.use('/departments', createResourceRouter(departmentController));
router.use('/programs', createResourceRouter(programController));
router.use('/invite_employers_referrals', createResourceRouter(employerReferralInvitationController));
router.use('/candidateinvitations', createResourceRouter(candidateReferralInvitationController));
router.use('/notifications', createResourceRouter(notificationController));

export default router;
