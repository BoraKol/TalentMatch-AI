import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { JobMatchComponent } from './components/job-match.component';
import { SettingsComponent } from './components/settings.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterCandidateComponent } from './components/auth/register-candidate.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

// Simple Auth Guard
const authGuard = () => {
    const authService = inject(AuthService);
    if (authService.isAuthenticated()) {
        return true;
    }
    // Redirect to login handled in component or here
    return false; // ideally redirect
};

export class AppRoutes {
    static routes: Routes = [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'login', component: LoginComponent },
        { path: 'register/candidate', component: RegisterCandidateComponent },
        {
            path: 'dashboard',
            component: DashboardComponent,
            // canActivate: [authGuard] // Enable later
        },
        { path: 'match', component: JobMatchComponent },
        { path: 'settings', component: SettingsComponent }
    ];
}
