import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideZonelessChangeDetection } from '@angular/core';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { provideRouter } from '@angular/router';
import { AppRoutes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(AppRoutes.routes),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideCharts(withDefaultRegisterables())
    ]
}).catch(err => console.error(err));
