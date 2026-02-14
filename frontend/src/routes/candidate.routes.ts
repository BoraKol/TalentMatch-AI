import { Routes } from '@angular/router';

export const CANDIDATE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../components/candidate/candidate-layout.component').then(m => m.CandidateLayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('../components/candidate/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
            },
            {
                path: 'profile/edit',
                loadComponent: () => import('../components/candidate/candidate-profile-edit.component').then(m => m.CandidateProfileEditComponent)
            },
            {
                path: 'jobs',
                loadComponent: () => import('../components/candidate/job-discovery.component').then(m => m.JobDiscoveryComponent)
            },
            {
                path: 'applications',
                loadComponent: () => import('../components/candidate/my-applications.component').then(m => m.MyApplicationsComponent)
            },
            {
                path: 'saved',
                loadComponent: () => import('../components/candidate/saved-jobs.component').then(m => m.SavedJobsComponent)
            }
        ]
    }
];
