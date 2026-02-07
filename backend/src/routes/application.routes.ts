import express from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware'; // Assuming auth middleware exists

const router = express.Router();

router.use(authenticate); // Application routes usually require auth

router.post('/apply', applicationController.apply);
router.get('/my-applications', applicationController.getMyApplications);
router.get('/recommended-jobs', applicationController.getRecommendedJobs);

export default router;
