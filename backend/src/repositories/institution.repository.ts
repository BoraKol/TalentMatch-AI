import Institution, { IInstitution } from '../models/institution.model';
import { BaseRepository } from './base.repository';

export class InstitutionRepository extends BaseRepository<IInstitution> {
    constructor() {
        super(Institution);
    }

    async findByEmailDomain(domain: string): Promise<IInstitution | null> {
        return await this.findOneByFilter({ emailDomain: domain.toLowerCase() });
    }
}

export const institutionRepository = new InstitutionRepository();
