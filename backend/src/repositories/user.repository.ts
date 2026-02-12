import User, { IUser } from '../models/user.model';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.findOneByFilter({ email });
    }
}

export const userRepository = new UserRepository();
