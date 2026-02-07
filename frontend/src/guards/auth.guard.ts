import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();

        // Check if route requires super_admin
        if (state.url.startsWith('/admin') && user?.role !== 'super_admin') {
            router.navigate(['/login']);
            return false;
        }

        return true;
    }

    router.navigate(['/login']);
    return false;
};

export const superAdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();
        if (user?.role === 'super_admin') {
            return true;
        }
    }

    router.navigate(['/login']);
    return false;
};

export const candidateGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();
        if (user?.role === 'candidate') {
            return true;
        }
    }

    router.navigate(['/login']);
    return false;
};

export const employerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();
        // institution_admin acts as the employer role
        if (user?.role === 'institution_admin') {
            return true;
        }
    }

    router.navigate(['/login']);
    return false;
};

