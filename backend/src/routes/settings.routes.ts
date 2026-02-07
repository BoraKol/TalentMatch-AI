import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller';

const router = Router();

// Skills
// Skills
router.get('/skills', SettingsController.getSkills);
router.post('/skills', SettingsController.addSkill);
router.get('/skills/:id', SettingsController.getSkillById);
router.put('/skills/:id', SettingsController.updateSkill);

// Employment Types
router.get('/employment-types', SettingsController.getEmploymentTypes);
router.post('/employment-types', SettingsController.addEmploymentType);
router.get('/employment-types/:id', SettingsController.getEmploymentTypeById);
router.put('/employment-types/:id', SettingsController.updateEmploymentType);

// Algorithm
router.get('/algorithm', SettingsController.getAlgorithmSettings);
router.put('/algorithm', SettingsController.updateAlgorithmSettings);

export default router;
