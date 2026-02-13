import { BaseRepository } from './base.repository';
import User, { IUser } from '../models/user.model';

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.findOneByFilter({ email });
    }

    async countByRole(role: string) {
        return await User.countDocuments({ role });
    }

    async getUserGrowth(since: Date) {
        return await User.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
    }
}

export const userRepository = new UserRepository();
