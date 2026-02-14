import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-candidate-layout',
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
              <a routerLink="/candidate/dashboard" class="flex items-center gap-2">
                <img src="/favicon.jpg" alt="TalentMatch" class="w-8 h-8 rounded-lg object-cover">
                <span class="font-bold text-xl text-slate-800 hidden sm:block">TalentMatch AI</span>
                <span class="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hidden sm:block">Candidate</span>
              </a>
              
              <!-- Desktop Navigation -->
              <div class="hidden md:flex space-x-1">
                <a routerLink="/candidate/dashboard" 
                   routerLinkActive="text-blue-600 bg-blue-50" 
                   [routerLinkActiveOptions]="{exact: true}"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                   Dashboard
                </a>
                <a routerLink="/candidate/jobs" 
                   routerLinkActive="text-amber-600 bg-amber-50"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors">
                   Referred Jobs
                </a>
                <a routerLink="/candidate/applications" 
                   routerLinkActive="text-teal-600 bg-teal-50"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors">
                   Applications
                </a>
                <a routerLink="/candidate/saved" 
                   routerLinkActive="text-violet-600 bg-violet-50"
                   class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-slate-50 transition-colors">
                   Saved
                </a>
              </div>
            </div>

            <!-- User Menu -->
            <div class="flex items-center gap-4">
              <div class="hidden sm:flex flex-col items-end mr-2">
                <span class="text-sm font-semibold text-slate-700">{{ user()?.firstName }}</span>
                <span class="text-xs text-slate-500">{{ user()?.email }}</span>
              </div>
              <a routerLink="/candidate/profile/edit" 
                 class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                 title="Edit Profile">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </a>
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
          <a routerLink="/candidate/dashboard" 
             routerLinkActive="text-blue-600"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="text-[10px] font-medium">Home</span>
          </a>
          <a routerLink="/candidate/jobs" 
             routerLinkActive="text-amber-600"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span class="text-[10px] font-medium">Jobs</span>
          </a>
          <a routerLink="/candidate/applications" 
             routerLinkActive="text-teal-600"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            <span class="text-[10px] font-medium">Status</span>
          </a>
          <a routerLink="/candidate/saved" 
             routerLinkActive="text-violet-600"
             class="flex flex-col items-center gap-1 text-slate-400 w-16">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            <span class="text-[10px] font-medium">Saved</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class CandidateLayoutComponent {
    authService = inject(AuthService);
    user = this.authService.currentUser;

    logout() {
        this.authService.logout();
    }
}
