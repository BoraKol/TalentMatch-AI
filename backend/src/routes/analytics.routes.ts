import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Institution stats (requires auth)
router.get('/institution', authMiddleware, (req, res) => analyticsController.getInstitutionStats(req, res));

// Employer stats (requires auth)
router.get('/employer', authMiddleware, (req, res) => analyticsController.getEmployerStats(req, res));

// Admin overview stats (requires auth)
router.get('/admin', authMiddleware, (req, res) => analyticsController.getAdminStats(req, res));

// General Dashboard Metrics (for /analytics/dashboard for Super Admin)
router.get('/dashboard', authMiddleware, (req, res) => analyticsController.getDashboardMetrics(req, res));

// Public: Active institutions list (for employer registration dropdown)
router.get('/institutions/active', (req, res) => analyticsController.getActiveInstitutions(req, res));

export default router;
