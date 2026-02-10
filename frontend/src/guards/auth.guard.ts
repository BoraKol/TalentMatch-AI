import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory function to create role-based guards
 */
export const createRoleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isAuthenticated()) {
            const user = authService.currentUser();
            if (user && allowedRoles.includes(user.role)) {
                return true;
            }
        }

        router.navigate(['/login']);
        return false;
    };
};

export const superAdminGuard = createRoleGuard(['super_admin']);
export const candidateGuard = createRoleGuard(['candidate']);
// Both institution_admin and employer roles can access employer routes
export const employerGuard = createRoleGuard(['institution_admin', 'employer']);
// Institution admins and users can access institution routes
export const institutionGuard = createRoleGuard(['institution_admin', 'institution_user']);

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        const user = authService.currentUser();

        // Check if route requires super_admin (legacy logic check)
        if (state.url.startsWith('/admin') && user?.role !== 'super_admin') {
            router.navigate(['/login']);
            return false;
        }

        return true;
    }

    router.navigate(['/login']);
    return false;
};
