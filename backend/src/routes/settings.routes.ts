import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller';

const router = Router();

// Skills
router.get('/skills', SettingsController.getSkills);
router.post('/skills', SettingsController.addSkill);

// Employment Types
router.get('/employment-types', SettingsController.getEmploymentTypes);
router.post('/employment-types', SettingsController.addEmploymentType);

// Algorithm
router.get('/algorithm', SettingsController.getAlgorithmSettings);
router.put('/algorithm', SettingsController.updateAlgorithmSettings);

export default router;
