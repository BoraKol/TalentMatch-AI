import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings.component';
import { JobMatchComponent } from './components/job-match.component';
import { ToastComponent } from './components/toast.component';

import { AnalyticsComponent } from './components/analytics.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    
    <!-- Render just Router Outlet for Auth Pages? Or full layout? 
         For now, we keeping Sidebar ALWAYS, but maybe we want to hide it for Login.
         Let's check router url or simply let it be. For a cleaner 'Login' page, 
         we ideally want no sidebar. But for simplicity in this step, let's keep it 
         or use a simple *ngIf checking current route excluding login.
    -->
    
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar (Hidden on Login/Register) -->
      @if (!isAuthPage()) {
      <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div class="p-6 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
              TM
            </div>
            <span class="font-bold text-lg tracking-tight">TalentMatch AI</span>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-2">
          <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
             [routerLinkActiveOptions]="{exact: true}"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          
          <a routerLink="/match" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            AI Matching
          </a>

          <a routerLink="/settings" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:bg-slate-800 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Algorithm Settings
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff" class="w-10 h-10 rounded-full border-2 border-slate-700">
            <div>
              <div class="text-sm font-bold">Super Admin</div>
              <div class="text-xs text-slate-500">super@admin.com</div>
            </div>
            <!-- Logout Button -->
            <button (click)="logout()" class="ml-auto text-slate-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      }

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-slate-50/50 relative">
        <!-- Background Elements -->
        <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
        
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isAuthPage() {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register');
  }

  logout() {
    this.authService.logout();
  }
}