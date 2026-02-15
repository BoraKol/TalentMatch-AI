import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Enable cookies for cross-origin requests
    const cookieReq = req.clone({
        withCredentials: true
    });

    return next(cookieReq).pipe(
        map(event => {
            if (event instanceof HttpResponse) {
                const body = event.body as any;
                if (body && body.success === true && body.data !== undefined) {
                    return event.clone({ body: body.data });
                }
            }
            return event;
        }),
        catchError((error: HttpErrorResponse) => {
            // Auto-logout on 401 (expired token) — except login requests
            if (error.status === 401 && !req.url.includes('/login')) {
                authService.clearLocalSession();
            }
            return throwError(() => error);
        })
    );
};
