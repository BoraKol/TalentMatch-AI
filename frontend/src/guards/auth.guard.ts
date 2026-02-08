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
        // Both institution_admin and employer roles can access employer routes
        if (user?.role === 'institution_admin' || user?.role === 'employer') {
            return true;
        }
    }

    router.navigate(['/login']);
    return false;
};

export const institutionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();
        // Institution admins and users can access institution routes
        if (user?.role === 'institution_admin' || user?.role === 'institution_user') {
            return true;
        }
    }

    router.navigate(['/login']);
    return false;
};
