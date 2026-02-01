
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { provideRouter } from '@angular/router';
import { AppRoutes } from './src/app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(AppRoutes.routes),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
