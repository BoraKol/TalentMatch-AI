import { testimonialService } from '../services/testimonial.service';
import { BaseController } from './base.controller';

export class TestimonialController extends BaseController<any> {
    constructor() {
        super(testimonialService);
    }
}

export const testimonialController = new TestimonialController();
