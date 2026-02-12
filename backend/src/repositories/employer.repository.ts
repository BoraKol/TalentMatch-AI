import Employer, { IEmployer } from '../models/employer.model';
import { BaseRepository } from './base.repository';

export class EmployerRepository extends BaseRepository<IEmployer> {
    constructor() {
        super(Employer);
    }

    async findByUserId(userId: string): Promise<IEmployer | null> {
        return await this.findOneByFilter({ user: userId });
    }
}

export const employerRepository = new EmployerRepository();
