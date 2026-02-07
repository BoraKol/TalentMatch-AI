import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

interface JobMatch {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  matchScore: number;
  skills: string[];
  postedDate: string;
  aiAnalysis?: string;
}

interface CandidateProfile {
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  experience: number;
  school: string;
  department: string;
  country: string;
  region: string;
  bio?: string;
}

@Component({
  // ... (selector, standalone, imports kept same)
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <!-- Consistent TM Logo (Blue for Candidate) -->
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                TM
              </div>
              <span class="font-bold text-xl text-slate-800">TalentMatch AI</span>
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Candidate</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="hidden md:flex flex-col items-end mr-2">
                <span class="text-sm font-semibold text-slate-700">{{ user()?.firstName }} {{ user()?.lastName }}</span>
                <span class="text-xs text-slate-500">{{ user()?.email }}</span>
              </div>
              <button (click)="logout()" 
                      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Banner (Replaces Profile Card) -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-blue-500/20">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 class="text-3xl font-bold">Welcome back, {{ user()?.firstName }}!</h1>
              <p class="text-blue-100 mt-2 text-lg">Your profile is active. Let AI find the perfect job matches for you.</p>
              
              <!-- Bio quick view -->
              <div *ngIf="profile()?.bio" class="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm inline-block">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="italic max-w-xl truncate">"{{ profile()?.bio }}"</span>
              </div>
            </div>
            
            <button (click)="editProfile()" class="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Profile
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
              <div class="text-2xl font-bold text-slate-800">{{ jobMatches().length }}</div>
              <div class="text-sm text-slate-500">Matched Jobs</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ getHighMatchCount() }}</div>
              <div class="text-sm text-slate-500">High Matches (80%+)</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ profile()?.skills?.length || 0 }}</div>
              <div class="text-sm text-slate-500">Skills Listed</div>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">Active</div>
              <div class="text-sm text-slate-500">Profile Status</div>
            </div>
          </div>
        </div>

        <!-- Job Matches -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800">Top 3 AI Job Matches</h2>
            <!-- View All Jobs button removed until route is implemented -->
          </div>

          <!-- Loading -->
          <div *ngIf="isLoading()" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>

          <!-- Job Cards (Grid Layout) -->
          <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let job of jobMatches()" 
                 class="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
              
              <!-- Card Header -->
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                  {{ job.company?.charAt(0) || 'C' }}
                </div>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                      [class]="job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                               job.matchScore >= 60 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'">
                  {{ job.matchScore }}% Match
                </span>
              </div>

              <!-- Job Info -->
              <div class="mb-4 flex-grow">
                <h3 class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">{{ job.title }}</h3>
                <p class="text-slate-500 font-medium text-sm">{{ job.company }}</p>
                
                <div class="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
                  <span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    {{ job.location }}
                  </span>
                  <span class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ job.type }}
                  </span>
                </div>
              </div>

              <!-- AI Analysis -->
              <div *ngIf="job.aiAnalysis" class="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                <div class="flex items-center gap-1 text-blue-900 font-bold mb-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  AI Insight
                </div>
                {{ job.aiAnalysis | slice:0:100 }}{{ job.aiAnalysis.length > 100 ? '...' : '' }}
              </div>

              <!-- Footer -->
              <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div class="flex -space-x-1 overflow-hidden">
                  <span *ngFor="let skill of job.skills?.slice(0, 3)" 
                        class="inline-block w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-medium"
                        title="{{skill}}">
                    {{ skill.charAt(0) }}
                  </span>
                  <span *ngIf="(job.skills?.length || 0) > 3" class="inline-block w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] text-slate-400 font-medium">
                    +{{ (job.skills?.length || 0) - 3 }}
                  </span>
                </div>

                <button (click)="applyToJob(job)" 
                        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-lg font-bold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        [disabled]="isApplying(job._id)">
                  {{ isApplying(job._id) ? 'Sending...' : 'Apply Now' }}
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="jobMatches().length === 0" class="col-span-full text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-700 mb-1">No AI matches found yet</h3>
              <p class="text-slate-500 text-sm max-w-sm mx-auto">Complete your profile bio and add more skills to help our AI find the best opportunities for you.</p>
              <button class="mt-4 text-blue-600 font-semibold text-sm hover:underline">Update Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidateDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;
  isLoading = signal(true);
  profile = signal<CandidateProfile | null>(null);
  jobMatches = signal<JobMatch[]>([]);

  applyingJobs = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadProfile();
    // Delay loading matches slightly to ensure profile is loaded first (optional)
    this.loadJobMatches();
  }

  loadProfile() {
    const userId = this.user()?.id;
    if (userId) {
      this.http.get<any>(`${environment.apiUrl}/candidates/user/${userId}`).subscribe({
        next: (data) => this.profile.set(data),
        error: () => {
          // Set default profile from user
          this.profile.set({
            firstName: this.user()?.firstName || '',
            lastName: this.user()?.lastName || '',
            email: this.user()?.email || '',
            skills: [],
            experience: 0,
            school: '',
            department: '',
            country: '',
            region: ''
          });
        }
      });
    }
  }

  loadJobMatches() {
    this.isLoading.set(true);
    // Use new AI Recommendations endpoint
    this.http.get<JobMatch[]>(`${environment.apiUrl}/applications/recommended-jobs`).subscribe({
      next: (matches) => {
        // Backend now returns strictly top 3 AI matches
        this.jobMatches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Failed to load AI matches, falling back to all jobs');
        // Fallback or empty state
        this.jobMatches.set([]);
        this.isLoading.set(false);
      }
    });
  }

  isApplying(jobId: string): boolean {
    return this.applyingJobs().has(jobId);
  }

  applyToJob(job: JobMatch) {
    if (this.isApplying(job._id)) return;

    this.applyingJobs.update(set => {
      const newSet = new Set(set);
      newSet.add(job._id);
      return newSet;
    });

    const payload = {
      jobId: job._id,
      aiMatchScore: job.matchScore
    };

    this.http.post(`${environment.apiUrl}/applications/apply`, payload).subscribe({
      next: () => {
        alert(`Successfully applied to ${job.title} at ${job.company}!`);
        this.applyingJobs.update(set => {
          const newSet = new Set(set);
          newSet.delete(job._id);
          return newSet;
        });
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to apply. Please try again.');
        this.applyingJobs.update(set => {
          const newSet = new Set(set);
          newSet.delete(job._id);
          return newSet;
        });
      }
    });
  }

  getInitials(): string {
    const first = this.profile()?.firstName || this.user()?.firstName || '';
    const last = this.profile()?.lastName || this.user()?.lastName || '';
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }

  editProfile() {
    this.router.navigate(['/candidate/profile/edit']);
  }

  getHighMatchCount(): number {
    return this.jobMatches().filter(j => j.matchScore >= 80).length;
  }

  logout() {
    this.authService.logout();
  }
}
