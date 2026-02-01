import { createResourceRouter } from './resource-router';
import { institutionController } from '../controllers/institution.controller';
import { Router } from 'express';

const router = createResourceRouter(institutionController);
// Custom routes can be added here
// router.post('/invite', institutionController.inviteAdmin);

export default router;
