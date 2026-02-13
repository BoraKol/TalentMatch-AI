import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
        })
    );
};
