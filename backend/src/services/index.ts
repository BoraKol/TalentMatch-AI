import User, { IUser } from '../models/user.model';
import Candidate, { ICandidate } from '../models/candidate.model';
import Employer, { IEmployer } from '../models/employer.model';
import Institution, { IInstitution } from '../models/institution.model';
import School, { ISchool } from '../models/school.model';
import Department, { IDepartment } from '../models/department.model';
import Program, { IProgram } from '../models/program.model';
import EmployerReferralInvitation, { IEmployerReferralInvitation } from '../models/employer-referral-invitation.model';
import CandidateReferralInvitation, { ICandidateReferralInvitation } from '../models/candidate-referral-invitation.model';
import Notification, { INotification } from '../models/notification.model';
import { BaseService } from './base.service';

export const userService = new BaseService<IUser>(User);
import { candidateService } from './candidate.service';
export { candidateService };

export const employerService = new BaseService<IEmployer>(Employer);
export const institutionService = new BaseService<IInstitution>(Institution);
export const schoolService = new BaseService<ISchool>(School);
export const departmentService = new BaseService<IDepartment>(Department);
export const programService = new BaseService<IProgram>(Program);
export const employerReferralInvitationService = new BaseService<IEmployerReferralInvitation>(EmployerReferralInvitation);
export const candidateReferralInvitationService = new BaseService<ICandidateReferralInvitation>(CandidateReferralInvitation);
export const notificationService = new BaseService<INotification>(Notification);
