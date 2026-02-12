import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  experience: number;
  school: string;
  matchScore?: number;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  applicationsCount: number;
}

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <img src="assets/favicon.jpg" alt="TalentMatch Logo" class="w-10 h-10 rounded-xl object-cover shadow-sm">
              <span class="font-bold text-xl text-slate-800">TalentMatch AI</span>
              <span class="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Employer</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-slate-600">{{ user()?.firstName }} {{ user()?.lastName }}</span>
              <button (click)="logout()" class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Card -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-emerald-500/20">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold">Welcome back, {{ user()?.firstName }}!</h1>
              <p class="text-emerald-100 mt-2">Find the perfect candidates for your open positions.</p>
            </div>
            <button routerLink="/employer/jobs/new" class="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
              + Post New Job
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ jobs().length }}</div>
              <div class="text-sm text-slate-500">Active Jobs</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ employerStats().totalApplications }}</div>
              <div class="text-sm text-slate-500">Applications</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ employerStats().matchRate }}%</div>
              <div class="text-sm text-slate-500">Match Rate</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">4.8</div>
              <div class="text-sm text-slate-500">Avg Rating</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <!-- Active Jobs -->
          <div class="col-span-1">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Your Active Jobs</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Job Cards (Updated detailed view) -->
                <div *ngFor="let job of jobs()" 
                     class="group relative bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                  
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">{{ job.title }}</h3>
                      <div class="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{{ job.location }}</span>
                      </div>
                    </div>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      {{ job.status }}
                    </span>
                  </div>

                  <div class="flex items-center gap-4 text-sm text-slate-600 mb-6">
                    <span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      {{ job.type }}
                    </span>
                    <span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      {{ job.applicationsCount || 0 }} Applicants
                    </span>
                  </div>

                  <a [routerLink]="['/employer/jobs', job._id, 'matches']" 
                     class="w-full flex justify-center items-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                    View AI Matches
                  </a>

                </div>

                <!-- Empty State Post Button -->
                <div *ngIf="jobs().length === 0" class="col-span-full text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <h3 class="text-lg font-medium text-slate-900">No active jobs</h3>
                  <p class="text-slate-500 mt-1 mb-6">Get started by posting your first job opening.</p>
                  <button routerLink="/employer/jobs/new" class="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                    Post a Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmployerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  isLoading = signal(true);
  candidates = signal<Candidate[]>([]);
  jobs = signal<Job[]>([]);
  employerStats = signal({
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    hiredCount: 0,
    matchRate: 0,
    institutionName: '',
    institutionId: null as string | null
  });

  ngOnInit() {
    this.loadJobs();
    this.loadEmployerAnalytics();
  }

  loadEmployerAnalytics() {
    this.http.get<any>(`${environment.apiUrl}/analytics/employer`).subscribe({
      next: (data) => {
        this.employerStats.set({
          activeJobs: data.activeJobs || 0,
          totalJobs: data.totalJobs || 0,
          totalApplications: data.totalApplications || 0,
          hiredCount: data.hiredCount || 0,
          matchRate: data.matchRate || 0,
          institutionName: data.institutionName || 'Independent',
          institutionId: data.institutionId
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadJobs() {
    this.http.get<Job[]>(`${environment.apiUrl}/jobs/my-jobs`).subscribe({
      next: (data) => {
        const withStatus = data.map(j => ({
          ...j,
          status: 'active'
        }));
        this.jobs.set(withStatus);
      },
      error: () => this.jobs.set([])
    });
  }

  getHighMatchCount(): number {
    return this.candidates().filter(c => (c.matchScore || 0) >= 80).length;
  }

  logout() {
    this.authService.logout();
  }
}
