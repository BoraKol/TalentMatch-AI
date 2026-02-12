import { IUser, UserRole } from '../models/user.model';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { candidateRepository, CandidateRepository } from '../repositories/candidate.repository';
import { employerRepository, EmployerRepository } from '../repositories/employer.repository';
import { hashPassword } from '../utils/password';

export interface CreateUserDTO {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    institutionId?: string;
    invitedBy?: string;
    isActive?: boolean;
    additionalData?: any;
}

export class UserFactory {
    private userRepo: UserRepository;
    private candidateRepo: CandidateRepository;
    private employerRepo: EmployerRepository;

    constructor() {
        this.userRepo = userRepository;
        this.candidateRepo = candidateRepository;
        this.employerRepo = employerRepository;
    }

    async createUser(data: CreateUserDTO): Promise<IUser> {
        const { email, password, firstName, lastName, role, institutionId, invitedBy, isActive, additionalData } = data;

        const hashedPassword = password ? await hashPassword(password) : undefined;

        // Base user creation
        const user = await this.userRepo.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            isActive: isActive !== undefined ? isActive : this.getDefaultActiveState(role),
            institution: institutionId as any,
            invitedBy: invitedBy as any
        });

        // Profile creation based on role
        if (role === 'candidate') {
            await this.candidateRepo.create({
                user: user._id,
                firstName,
                lastName,
                email,
                ...additionalData
            });
        } else if (role === 'employer') {
            await this.employerRepo.create({
                user: user._id,
                institution: institutionId as any,
                name: additionalData?.companyName || `${firstName} ${lastName}`,
                industry: additionalData?.industry || '',
                website: additionalData?.website || '',
                contactEmail: email
            });
        }

        return user;
    }

    private getDefaultActiveState(role: UserRole): boolean {
        switch (role) {
            case 'super_admin':
            case 'candidate':
                return true;
            case 'institution_admin':
            case 'employer':
            case 'institution_user':
                return false; // Default to pending approval
            default:
                return false;
        }
    }
}

export const userFactory = new UserFactory();
