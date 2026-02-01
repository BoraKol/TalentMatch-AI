import { createResourceRouter } from './resource-router';
import { testimonialController } from '../controllers/testimonial.controller';

const router = createResourceRouter(testimonialController);

export default router;
