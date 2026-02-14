import { CandidateService } from '../../src/services/candidate.service';
import { candidateRepository } from '../../src/repositories/candidate.repository';
import { userRepository } from '../../src/repositories/user.repository';

// Mock repositories
jest.mock('../../src/repositories/candidate.repository');
jest.mock('../../src/repositories/user.repository');

describe('CandidateService', () => {
    let candidateService: CandidateService;

    beforeEach(() => {
        candidateService = new CandidateService();
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('should update candidate profile and linked user data', async () => {
            const candidateId = 'candidate123';
            const userId = 'user123';
            const updates = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                title: 'Senior Dev'
            };

            const mockCandidate = {
                _id: candidateId,
                user: userId,
                firstName: 'John',
                lastName: 'Doe'
            };

            (candidateRepository.findOne as jest.Mock).mockResolvedValue(mockCandidate);
            (candidateRepository.update as jest.Mock).mockResolvedValue({ ...mockCandidate, ...updates });
            (userRepository.update as jest.Mock).mockResolvedValue({});

            const result = await candidateService.updateProfile(candidateId, updates);

            expect(candidateRepository.findOne).toHaveBeenCalledWith(candidateId);
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com'
            });
            expect(candidateRepository.update).toHaveBeenCalledWith(candidateId, updates);
            expect(result).toEqual(expect.objectContaining(updates));
        });

        it('should throw error if candidate not found', async () => {
            (candidateRepository.findOne as jest.Mock).mockResolvedValue(null);

            await expect(candidateService.updateProfile('invalidId', {}))
                .rejects
                .toThrow('Candidate not found');
        });

        it('should not update user if no user-related fields provided', async () => {
            const candidateId = 'candidate123';
            const userId = 'user123';
            const updates = { title: 'Senior Dev' }; // No name/email changes

            const mockCandidate = { _id: candidateId, user: userId };
            (candidateRepository.findOne as jest.Mock).mockResolvedValue(mockCandidate);
            (candidateRepository.update as jest.Mock).mockResolvedValue({ ...mockCandidate, ...updates });

            await candidateService.updateProfile(candidateId, updates);

            expect(userRepository.update).not.toHaveBeenCalled();
            expect(candidateRepository.update).toHaveBeenCalledWith(candidateId, updates);
        });
    });

    describe('getByUserId', () => {
        it('should return candidate if found', async () => {
            const userId = 'user123';
            const mockCandidate = { _id: 'candidate123', user: userId };

            (candidateRepository.findWithUser as jest.Mock).mockResolvedValue([mockCandidate]);

            const result = await candidateService.getByUserId(userId);

            expect(candidateRepository.findWithUser).toHaveBeenCalledWith({ user: userId });
            expect(result).toEqual(mockCandidate);
        });

        it('should return null if candidate not found', async () => {
            (candidateRepository.findWithUser as jest.Mock).mockResolvedValue([]);

            const result = await candidateService.getByUserId('user123');

            expect(result).toBeNull();
        });
    });
});
