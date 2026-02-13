
import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterCandidateComponent } from './components/auth/register-candidate.component';
import { RegisterEmployerComponent } from './components/auth/register-employer.component';
import { RegisterInstitutionComponent } from './components/auth/register-institution.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { superAdminGuard, candidateGuard, employerGuard, institutionGuard } from './guards/auth.guard';

import { ADMIN_ROUTES } from './routes/admin.routes';
import { INSTITUTION_ROUTES } from './routes/institution.routes';
import { EMPLOYER_ROUTES } from './routes/employer.routes';
import { CANDIDATE_ROUTES } from './routes/candidate.routes';

export class AppRoutes {
    static routes: Routes = [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent },

        // Auth Routes
        {
            path: 'forgot-password',
            loadComponent: () => import('./components/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
        },
        {
            path: 'reset-password',
            loadComponent: () => import('./components/auth/reset-password.component').then(m => m.ResetPasswordComponent)
        },

        { path: 'register/candidate', component: RegisterCandidateComponent },
        { path: 'register/employer', component: RegisterEmployerComponent },
        { path: 'register/institution', component: RegisterInstitutionComponent },

        // Public: Accept Invite
        {
            path: 'accept-invite/:token',
            loadComponent: () => import('./components/admin/accept-invite.component').then(m => m.AcceptInviteComponent)
        },

        // Protected Feature Routes
        {
            path: 'candidate',
            canActivate: [candidateGuard],
            children: CANDIDATE_ROUTES
        },
        {
            path: 'employer',
            canActivate: [employerGuard],
            children: EMPLOYER_ROUTES
        },
        {
            path: 'institution',
            canActivate: [institutionGuard],
            children: INSTITUTION_ROUTES
        },
        {
            path: 'admin',
            component: AdminLayoutComponent,
            canActivate: [superAdminGuard],
            children: ADMIN_ROUTES
        },

        // Redirects
        { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
        { path: 'institutions', redirectTo: 'admin/institutions/list', pathMatch: 'full' },
        { path: 'settings', redirectTo: 'admin/settings/algorithm', pathMatch: 'full' },
        { path: '**', redirectTo: 'login' }
    ];
}
