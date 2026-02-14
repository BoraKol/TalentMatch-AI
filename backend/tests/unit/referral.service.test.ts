import { ReferralService } from '../../src/services/referral.service';
import { candidateRepository } from '../../src/repositories/candidate.repository';
import { referralRepository } from '../../src/repositories/referral.repository';
import { jobRepository } from '../../src/repositories/job.repository';
import { aiMatchingService } from '../../src/services/ai-matching.service';

// Mock dependencies
jest.mock('../../src/repositories/candidate.repository');
jest.mock('../../src/repositories/referral.repository');
jest.mock('../../src/repositories/job.repository');
jest.mock('../../src/services/ai-matching.service');
jest.mock('../../src/services/email.service');
jest.mock('../../src/services/strategies/gemini.strategy');
jest.mock('../../src/services/strategies/quick.strategy');

describe('ReferralService', () => {
    let referralService: ReferralService;

    beforeEach(() => {
        referralService = new ReferralService();
        jest.clearAllMocks();
    });

    describe('getCandidatesForReferral', () => {
        it('should return mapped candidates', async () => {
            const mockCandidates = [{
                _id: 'c1',
                firstName: 'John',
                lastName: 'Doe',
                user: { email: 'john@example.com' },
                currentTitle: 'Dev',
                skills: ['JS'],
                experience: 5
            }];

            (candidateRepository.findWithUser as jest.Mock).mockResolvedValue(mockCandidates);

            const result = await referralService.getCandidatesForReferral();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
            expect(result[0].email).toBe('john@example.com');
        });
    });

    describe('createReferral', () => {
        it('should create referral if not existing', async () => {
            const data = {
                candidateId: 'c1',
                jobId: 'j1',
                aiMatchScore: 90,
                aiAnalysis: 'Great match',
                notes: 'Recommended'
            };
            const referredBy = 'u1';

            (referralRepository.findOneByFilter as jest.Mock).mockResolvedValue(null);
            (referralRepository.create as jest.Mock).mockResolvedValue({ _id: 'r1', ...data });

            const result = await referralService.createReferral(referredBy, data);

            expect(referralRepository.create).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw error if already referred', async () => {
            const data = { candidateId: 'c1', jobId: 'j1', aiMatchScore: 90 };
            (referralRepository.findOneByFilter as jest.Mock).mockResolvedValue({ _id: 'r1' });

            await expect(referralService.createReferral('u1', data))
                .rejects
                .toThrow('This candidate has already been referred to this job');
        });
    });

    describe('respondToReferral', () => {
        it('should update referral status', async () => {
            const userId = 'u1';
            const referralId = 'r1';
            const action = 'accepted';

            const mockCandidate = { _id: 'c1', user: userId };
            const mockReferral = { _id: referralId, candidate: 'c1', status: 'pending' };

            (candidateRepository.findOneByFilter as jest.Mock).mockResolvedValue(mockCandidate);
            (referralRepository.findOneByFilter as jest.Mock).mockResolvedValue(mockReferral);
            (referralRepository.update as jest.Mock).mockResolvedValue({ ...mockReferral, status: action });

            const result = await referralService.respondToReferral(userId, referralId, action);

            expect(referralRepository.update).toHaveBeenCalledWith(referralId, expect.objectContaining({ status: action }));
            expect(result.status).toBe(action);
        });
    });

    describe('autoMatchCandidates', () => {
        it('should return recommendations', async () => {
            const mockCandidates = [{ _id: 'c1', firstName: 'John' }];
            const mockJobs = [{ _id: 'j1', title: 'Dev' }];
            const mockMatches = [{ id: 'j1', title: 'Dev', matchScore: 95, aiAnalysis: 'Good' }];

            (candidateRepository.find as jest.Mock).mockResolvedValue(mockCandidates);
            (jobRepository.findActive as jest.Mock).mockResolvedValue(mockJobs);
            (referralRepository.find as jest.Mock).mockResolvedValue([]); // No existing referrals
            (aiMatchingService.findTopJobsForCandidate as jest.Mock).mockResolvedValue(mockMatches);

            const result = await referralService.autoMatchCandidates();

            expect(result).toHaveLength(1);
            expect(result[0].candidate._id).toBe('c1');
            expect(result[0].matches[0].jobId).toBe('j1');
        });
    });
});
