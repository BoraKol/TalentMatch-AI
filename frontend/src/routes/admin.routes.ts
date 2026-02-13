import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../components/admin/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    {
        path: 'referrals',
        loadComponent: () => import('../components/admin/referral-hub.component').then(m => m.ReferralHubComponent)
    },
    {
        path: 'approvals',
        loadComponent: () => import('../components/admin/admin-approvals.component').then(m => m.AdminApprovalsComponent)
    },
    {
        path: 'institutions',
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            {
                path: 'list',
                loadComponent: () => import('../components/admin/institutions/institution-list.component').then(m => m.InstitutionListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('../components/admin/institutions/institution-create.component').then(m => m.InstitutionCreateComponent)
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../components/admin/institutions/institution-create.component').then(m => m.InstitutionCreateComponent)
            }
        ]
    },
    {
        path: 'testimonials',
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            {
                path: 'list',
                loadComponent: () => import('../components/admin/testimonials/testimonial-list.component').then(m => m.TestimonialListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('../components/admin/testimonials/testimonial-create.component').then(m => m.TestimonialCreateComponent)
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../components/admin/testimonials/testimonial-create.component').then(m => m.TestimonialCreateComponent)
            }
        ]
    },
    {
        path: 'settings',
        children: [
            { path: '', redirectTo: 'algorithm', pathMatch: 'full' },
            {
                path: 'algorithm',
                loadComponent: () => import('../components/admin/settings/algorithm-settings.component').then(m => m.AlgorithmSettingsComponent)
            },
            {
                path: 'employment-types',
                loadComponent: () => import('../components/admin/settings/employment-types-list.component').then(m => m.EmploymentTypesListComponent)
            },
            {
                path: 'employment-types/create',
                loadComponent: () => import('../components/admin/settings/employment-type-create.component').then(m => m.EmploymentTypeCreateComponent)
            },
            {
                path: 'employment-types/edit/:id',
                loadComponent: () => import('../components/admin/settings/employment-type-create.component').then(m => m.EmploymentTypeCreateComponent)
            },
            {
                path: 'skills',
                loadComponent: () => import('../components/admin/settings/skills-list.component').then(m => m.SkillsListComponent)
            },
            {
                path: 'skills/create',
                loadComponent: () => import('../components/admin/settings/skill-create.component').then(m => m.SkillCreateComponent)
            },
            {
                path: 'skills/edit/:id',
                loadComponent: () => import('../components/admin/settings/skill-create.component').then(m => m.SkillCreateComponent)
            }
        ]
    }
];
