import Institution, { IInstitution } from '../models/institution.model';
import { BaseService } from './base.service';

class InstitutionService extends BaseService<IInstitution> {
    constructor() {
        super(Institution);
    }
}

export const institutionService = new InstitutionService();
