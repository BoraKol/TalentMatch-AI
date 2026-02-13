import { Routes } from '@angular/router';

export const INSTITUTION_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadComponent: () => import('../components/institution/institution-dashboard.component').then(m => m.InstitutionDashboardComponent)
    },
    {
        path: 'team/invite',
        loadComponent: () => import('../components/institution/invite-team.component').then(m => m.InviteTeamComponent)
    },
    {
        path: 'jobs/new',
        loadComponent: () => import('../components/employer/job-post.component').then(m => m.JobPostComponent)
    },
    {
        path: 'jobs/:jobId/matches',
        loadComponent: () => import('../components/employer/ai-match-results.component').then(m => m.AiMatchResultsComponent)
    },
    {
        path: 'referrals',
        loadComponent: () => import('../components/admin/referral-hub.component').then(m => m.ReferralHubComponent)
    },
    {
        path: 'candidates',
        loadComponent: () => import('../components/institution/find-candidates.component').then(m => m.FindCandidatesComponent)
    },
    {
        path: 'candidates/:candidateId',
        loadComponent: () => import('../components/employer/candidate-profile.component').then(m => m.CandidateProfileComponent)
    }
];
