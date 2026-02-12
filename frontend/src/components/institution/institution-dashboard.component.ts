import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <!-- Navbar -->
      <nav class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center gap-8">
              <div class="flex items-center gap-2">
                <img src="/favicon.jpg" alt="TalentMatch Logo" class="w-8 h-8 rounded-lg object-cover shadow-sm">
                <span class="text-xl font-bold text-slate-800">TalentMatch AI</span>
                <span class="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Institution</span>
              </div>
              <div class="hidden sm:flex space-x-6">
                <a routerLink="/institution/dashboard" class="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-4 -mb-4">Dashboard</a>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm font-medium text-slate-800">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</p>
                <p class="text-xs text-slate-500">{{ getRoleDisplay() }}</p>
              </div>
              <button (click)="authService.logout()" class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h1 class="text-3xl font-bold">Welcome back, {{ authService.currentUser()?.firstName }}!</h1>
          <p class="mt-2 text-indigo-100">Manage your institution, invite users, and connect with talent.</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold" [class]="stats().userCount > stats().maxUsers ? 'text-red-600' : 'text-slate-800'">{{ Math.min(stats().userCount, stats().maxUsers) }}/{{ stats().maxUsers }}</p>
                <p class="text-sm" [class]="stats().userCount > stats().maxUsers ? 'text-red-500' : 'text-slate-500'">{{ stats().userCount > stats().maxUsers ? 'Over Limit!' : 'Active Users' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats().jobCount }}</p>
                <p class="text-sm text-slate-500">Job Postings</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats().candidateCount }}</p>
                <p class="text-sm text-slate-500">Candidates</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats().employerCount }}</p>
                <p class="text-sm text-slate-500">Employers</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <a *ngIf="stats().remainingSlots > 0" routerLink="/institution/team/invite" class="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span class="font-medium">Invite Team Member</span>
                <span class="ml-auto text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">{{ stats().remainingSlots }} slots left</span>
              </a>
              <div *ngIf="stats().remainingSlots <= 0" class="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span class="font-medium">User limit reached</span>
                <span class="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">{{ stats().maxUsers }}/{{ stats().maxUsers }} max</span>
              </div>
              <a routerLink="/institution/jobs/new" class="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span class="font-medium">Post a Job</span>
              </a>
              <a routerLink="/institution/candidates" class="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="font-medium">Find Candidates</span>
              </a>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">Institution Info</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-slate-500">Institution Name</span>
                <span class="font-medium text-slate-800">{{ authService.currentUser()?.companyName || 'Not set' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-slate-500">Your Role</span>
                <span class="font-medium text-slate-800">{{ getRoleDisplay() }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-slate-500">User Limit</span>
                <span class="font-medium text-slate-800">{{ stats().maxUsers }} users max</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-slate-500">Status</span>
                <span class="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InstitutionDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  Math = Math; // Expose for template

  stats = signal({
    userCount: 1,
    maxUsers: 5,
    jobCount: 0,
    candidateCount: 0,
    employerCount: 0,
    remainingSlots: 4
  });

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/analytics/institution`).subscribe({
      next: (data) => {
        const maxUsers = data.maxUsers || 5;
        const userCount = data.userCount || 1;
        this.stats.set({
          userCount,
          maxUsers,
          jobCount: data.jobCount || 0,
          candidateCount: data.candidateCount || 0,
          employerCount: data.employerCount || 0,
          remainingSlots: Math.max(0, data.remainingSlots ?? (maxUsers - userCount))
        });
      },
      error: (err) => console.error('Failed to load institution stats:', err)
    });
  }

  getRoleDisplay(): string {
    const role = this.authService.currentUser()?.role;
    if (role === 'institution_admin') return 'Institution Admin';
    if (role === 'institution_user') return 'Institution User';
    return role || 'Unknown';
  }
}

