import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-employer-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <!-- Top Navigation (Desktop & Mobile Header) -->
      <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <!-- Logo & Desktop Links -->
            <div class="flex items-center gap-8">
              <a [routerLink]="dashboardLink" class="flex items-center gap-2">
                <img src="/favicon.jpg" alt="TalentMatch" class="w-8 h-8 rounded-lg object-cover">
                <span class="font-bold text-xl text-slate-800 hidden sm:block">TalentMatch AI</span>
                <span class="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full hidden sm:block">Employer</span>
              </a>
              
              <!-- Desktop Navigation -->
              <div class="hidden md:flex space-x-1">
                <a [routerLink]="dashboardLink" 
                   routerLinkActive="text-emerald-600 bg-emerald-50" 
                   [routerLinkActiveOptions]="{exact: true}"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                   Dashboard
                </a>
                <a routerLink="/employer/jobs/new" 
                   routerLinkActive="text-emerald-600 bg-emerald-50"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                   Post a Job
                </a>
              </div>
            </div>

            <!-- User Menu -->
            <div class="flex items-center gap-4">
              <div class="hidden sm:flex flex-col items-end mr-2">
                <span class="text-sm font-semibold text-slate-700">{{ user()?.firstName }} {{ user()?.lastName }}</span>
                <span class="text-xs text-slate-500">{{ user()?.email }}</span>
              </div>
              <button (click)="logout()" 
                      class="text-slate-400 hover:text-red-500 transition-colors"
                      title="Sign Out">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main>
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-4 pb-safe">
        <div class="flex justify-around items-center h-16">
          <a [routerLink]="dashboardLink" 
             routerLinkActive="text-emerald-600"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="text-[10px] font-medium">Home</span>
          </a>
          <a routerLink="/employer/jobs/new" 
             routerLinkActive="text-emerald-600"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span class="text-[10px] font-medium">Post Job</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class EmployerLayoutComponent {
    authService = inject(AuthService);
    user = this.authService.currentUser;

    get dashboardLink(): string {
        const role = this.user()?.role;
        if (role === 'institution_admin' || role === 'institution_user') {
            return '/institution/dashboard';
        }
        return '/employer/dashboard';
    }

    logout() {
        this.authService.logout();
    }
}
