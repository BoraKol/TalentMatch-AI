import { Routes } from '@angular/router';
import { EmployerLayoutComponent } from '../components/employer/employer-layout.component';

export const EMPLOYER_ROUTES: Routes = [
    {
        path: '',
        component: EmployerLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('../components/employer/employer-dashboard.component').then(m => m.EmployerDashboardComponent)
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
                path: 'candidates/:candidateId',
                loadComponent: () => import('../components/employer/candidate-profile.component').then(m => m.CandidateProfileComponent)
            }
        ]
    }
];
