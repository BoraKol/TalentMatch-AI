import Testimonial, { ITestimonial } from '../models/testimonial.model';
import { BaseService } from './base.service';

class TestimonialService extends BaseService<ITestimonial> {
    constructor() {
        super(Testimonial);
    }
}

export const testimonialService = new TestimonialService();
