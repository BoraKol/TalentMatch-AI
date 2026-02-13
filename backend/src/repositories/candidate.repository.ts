import { BaseRepository } from './base.repository';
import Candidate, { ICandidate } from '../models/candidate.model';

export class CandidateRepository extends BaseRepository<ICandidate> {
    constructor() {
        super(Candidate);
    }

    // Add specific methods here if needed
    async findByEmail(email: string): Promise<ICandidate | null> {
        return null; // Placeholder
    }

    async findWithUser(query: any) {
        return await Candidate.find(query)
            .populate('user', 'email institution role')
            .sort({ createdAt: -1 })
            .lean();
    }

    async findInInstitution(institutionId: string) {
        const candidates = await Candidate.find()
            .populate({
                path: 'user',
                match: { institution: institutionId },
                select: 'institution'
            })
            .lean();

        return candidates.filter(c => c.user);
    }

    async getSkillDistribution(limit: number = 10) {
        return await Candidate.aggregate([
            { $unwind: "$skills" },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);
    }

    async getExperienceDistribution() {
        return await Candidate.aggregate([
            {
                $bucket: {
                    groupBy: "$experience",
                    boundaries: [0, 2, 5, 10, 20],
                    default: "20+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);
    }

    async getHiresByInstitution() {
        return await Candidate.aggregate([
            { $match: { status: 'hired' } },
            { $group: { _id: "$institution", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }

    async getInstitutionPerformance() {
        return await Candidate.aggregate([
            { $match: { status: 'hired' } },
            {
                $lookup: {
                    from: 'institutions',
                    localField: 'institution',
                    foreignField: '_id',
                    as: 'instInfo'
                }
            },
            { $unwind: "$instInfo" },
            { $group: { _id: "$instInfo.name", hires: { $sum: 1 } } },
            { $sort: { hires: -1 } }
        ]);
    }

    async getCandidateDistribution() {
        return await Candidate.aggregate([
            {
                $lookup: {
                    from: 'institutions',
                    localField: 'institution',
                    foreignField: '_id',
                    as: 'instInfo'
                }
            },
            { $unwind: { path: "$instInfo", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$instInfo.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
    }
}
export const candidateRepository = new CandidateRepository();
