import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterCandidateComponent } from './components/auth/register-candidate.component';
import { RegisterEmployerComponent } from './components/auth/register-employer.component';
import { RegisterInstitutionComponent } from './components/auth/register-institution.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { superAdminGuard, candidateGuard, employerGuard, institutionGuard } from './guards/auth.guard';

export class AppRoutes {
    static routes: Routes = [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent },
        { path: 'register/candidate', component: RegisterCandidateComponent },
        { path: 'register/employer', component: RegisterEmployerComponent },
        { path: 'register/institution', component: RegisterInstitutionComponent },

        // Public: Accept Invite (all types)
        {
            path: 'accept-invite/:token',
            loadComponent: () => import('./components/admin/accept-invite.component').then(m => m.AcceptInviteComponent)
        },
        // Candidate Routes (Protected)
        {
            path: 'candidate',
            canActivate: [candidateGuard],
            children: [
                { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                {
                    path: 'dashboard',
                    loadComponent: () => import('./components/candidate/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
                },
                {
                    path: 'profile/edit',
                    loadComponent: () => import('./components/candidate/candidate-profile-edit.component').then(m => m.CandidateProfileEditComponent)
                }
            ]
        },

        // Employer Routes (Protected)
        {
            path: 'employer',
            canActivate: [employerGuard],
            children: [
                { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                {
                    path: 'dashboard',
                    loadComponent: () => import('./components/employer/employer-dashboard.component').then(m => m.EmployerDashboardComponent)
                },
                {
                    path: 'jobs/new',
                    loadComponent: () => import('./components/employer/job-post.component').then(m => m.JobPostComponent)
                },
                {
                    path: 'jobs/:jobId/matches',
                    loadComponent: () => import('./components/employer/ai-match-results.component').then(m => m.AiMatchResultsComponent)
                },
                {
                    path: 'candidates/:candidateId',
                    loadComponent: () => import('./components/employer/candidate-profile.component').then(m => m.CandidateProfileComponent)
                }
            ]
        },

        // Institution Routes (Protected)
        {
            path: 'institution',
            canActivate: [institutionGuard],
            children: [
                { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                {
                    path: 'dashboard',
                    loadComponent: () => import('./components/institution/institution-dashboard.component').then(m => m.InstitutionDashboardComponent)
                },
                {
                    path: 'team/invite',
                    loadComponent: () => import('./components/institution/invite-team.component').then(m => m.InviteTeamComponent)
                },
                {
                    path: 'jobs/new',
                    loadComponent: () => import('./components/employer/job-post.component').then(m => m.JobPostComponent)
                },
                {
                    path: 'jobs/:jobId/matches',
                    loadComponent: () => import('./components/employer/ai-match-results.component').then(m => m.AiMatchResultsComponent)
                },
                {
                    path: 'candidates',
                    loadComponent: () => import('./components/institution/find-candidates.component').then(m => m.FindCandidatesComponent)
                },
                {
                    path: 'candidates/:candidateId',
                    loadComponent: () => import('./components/employer/candidate-profile.component').then(m => m.CandidateProfileComponent)
                }
            ]
        },

        // Admin Routes (Protected)
        {
            path: 'admin',
            component: AdminLayoutComponent,
            canActivate: [superAdminGuard],
            children: [
                { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                { path: 'dashboard', component: AdminDashboardComponent },
                {
                    path: 'institutions',
                    children: [
                        { path: '', redirectTo: 'list', pathMatch: 'full' },
                        {
                            path: 'list',
                            loadComponent: () => import('./components/admin/institutions/institution-list.component').then(m => m.InstitutionListComponent)
                        },
                        {
                            path: 'create',
                            loadComponent: () => import('./components/admin/institutions/institution-create.component').then(m => m.InstitutionCreateComponent)
                        },
                        {
                            path: 'edit/:id',
                            loadComponent: () => import('./components/admin/institutions/institution-create.component').then(m => m.InstitutionCreateComponent)
                        }
                    ]
                },
                {
                    path: 'testimonials',
                    children: [
                        { path: '', redirectTo: 'list', pathMatch: 'full' },
                        {
                            path: 'list',
                            loadComponent: () => import('./components/admin/testimonials/testimonial-list.component').then(m => m.TestimonialListComponent)
                        },
                        {
                            path: 'create',
                            loadComponent: () => import('./components/admin/testimonials/testimonial-create.component').then(m => m.TestimonialCreateComponent)
                        },
                        {
                            path: 'edit/:id',
                            loadComponent: () => import('./components/admin/testimonials/testimonial-create.component').then(m => m.TestimonialCreateComponent)
                        }
                    ]
                },
                {
                    path: 'settings',
                    children: [
                        { path: '', redirectTo: 'algorithm', pathMatch: 'full' },
                        {
                            path: 'algorithm',
                            loadComponent: () => import('./components/admin/settings/algorithm-settings.component').then(m => m.AlgorithmSettingsComponent)
                        },
                        {
                            path: 'employment-types',
                            loadComponent: () => import('./components/admin/settings/employment-types-list.component').then(m => m.EmploymentTypesListComponent)
                        },
                        {
                            path: 'employment-types/create',
                            loadComponent: () => import('./components/admin/settings/employment-type-create.component').then(m => m.EmploymentTypeCreateComponent)
                        },
                        {
                            path: 'employment-types/edit/:id',
                            loadComponent: () => import('./components/admin/settings/employment-type-create.component').then(m => m.EmploymentTypeCreateComponent)
                        },
                        {
                            path: 'skills',
                            loadComponent: () => import('./components/admin/settings/skills-list.component').then(m => m.SkillsListComponent)
                        },
                        {
                            path: 'skills/create',
                            loadComponent: () => import('./components/admin/settings/skill-create.component').then(m => m.SkillCreateComponent)
                        },
                        {
                            path: 'skills/edit/:id',
                            loadComponent: () => import('./components/admin/settings/skill-create.component').then(m => m.SkillCreateComponent)
                        }
                    ]
                }
            ]
        },

        // Legacy routes redirect to admin
        { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
        { path: 'institutions', redirectTo: 'admin/institutions/list', pathMatch: 'full' },
        { path: 'settings', redirectTo: 'admin/settings/algorithm', pathMatch: 'full' }
    ];
}

