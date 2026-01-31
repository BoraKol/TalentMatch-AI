import { Router } from 'express';
import { getDashboardData } from '../controllers/analytics.controller';

const router = Router();

router.get('/dashboard', getDashboardData);

export default router;
