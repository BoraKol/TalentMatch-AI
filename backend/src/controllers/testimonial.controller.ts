import Testimonial from '../models/testimonial.model';
import { BaseController } from './base.controller';

export class TestimonialController extends BaseController<any> {
    constructor() {
        super(Testimonial);
    }
}

export const testimonialController = new TestimonialController();
