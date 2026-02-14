import { AuthService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';
import { institutionRepository } from '../../src/repositories/institution.repository';
import { userFactory } from '../../src/services/user-factory.service';
import { comparePassword } from '../../src/utils/password';
import { generateToken } from '../../src/utils/jwt';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/institution.repository');
jest.mock('../../src/services/user-factory.service');
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/jwt');

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService();
    });

    describe('login', () => {
        it('should return token and user when credentials are valid', async () => {
            const mockUser = {
                _id: 'user-id',
                email: 'test@example.com',
                password: 'hashed-password',
                isActive: true,
                role: 'candidate',
                firstName: 'Test',
                lastName: 'User',
                populate: jest.fn().mockResolvedValue(true),
                institution: null
            };

            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (comparePassword as jest.Mock).mockResolvedValue(true);
            (generateToken as jest.Mock).mockReturnValue('fake-token');

            const result = await authService.login('test@example.com', 'password123');

            expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(result).toHaveProperty('token', 'fake-token');
            expect(result.user).toHaveProperty('email', 'test@example.com');
        });

        it('should throw error if user not found', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(authService.login('wrong@example.com', 'password')).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if password does not match', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashed-password',
                isActive: true
            };

            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (comparePassword as jest.Mock).mockResolvedValue(false);

            await expect(authService.login('test@example.com', 'wrong-pass')).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if user is inactive', async () => {
            const mockUser = {
                email: 'test@example.com',
                isActive: false // Inactive
            };

            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

            await expect(authService.login('test@example.com', 'any')).rejects.toThrow(/pending Super Admin approval/);
        });
    });

    describe('registerCandidate', () => {
        it('should register a new candidate successfully', async () => {
            const mockData = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'Candidate',
                skills: ['Node.js']
            };

            const mockCreatedUser = {
                _id: 'new-user-id',
                email: 'new@example.com',
                role: 'candidate',
                firstName: 'New',
                lastName: 'Candidate'
            };

            (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // No existing user
            (userFactory.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);
            (generateToken as jest.Mock).mockReturnValue('new-token');

            const result = await authService.registerCandidate(mockData);

            expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
            expect(userFactory.createUser).toHaveBeenCalled();
            expect(result).toHaveProperty('token', 'new-token');
            expect(result.message).toBe('Candidate registered successfully');
        });

        it('should throw error if email already exists', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue({ _id: 'existing' });

            await expect(authService.registerCandidate({
                email: 'existing@example.com',
                password: 'valid-password',
                firstName: 'Exist',
                lastName: 'User'
            })).rejects.toThrow('Email already exists');
        });
    });
});
