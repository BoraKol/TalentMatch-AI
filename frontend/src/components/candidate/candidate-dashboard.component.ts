import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { EmptyStateComponent } from '../shared/empty-state.component';

interface JobMatch {
  id: string;
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

interface SkillGap {
  skill: string;
  jobsUnlocked: number;
  exampleJobs: string[];
  impact: 'high' | 'medium' | 'low';
}

interface SkillGapResponse {
  currentSkills: string[];
  gaps: SkillGap[];
  totalJobs: number;
  matchableJobs: number;
}

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">🔓</span>
                <span class="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">Unlocking Hidden Jobs</span>
              </div>
              <h1 class="text-3xl font-bold">Welcome back, {{ user()?.firstName }}!</h1>
              <p class="text-blue-100 mt-2 text-lg">Your referral specialist is matching you with opportunities you'd never find on your own.</p>
              
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

        <!-- Navigation Tabs (Removed as they are now in Layout) -->

        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-800">{{ myReferralCount() }}</div>
              <div class="text-sm text-slate-500">Referral Matches</div>
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

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Job Matches (Left 2/3) -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-slate-800">🔓 Your Referral Matches</h2>
              <button (click)="navigateTo('/candidate/jobs')" class="text-sm text-amber-600 font-semibold hover:underline">View All Referrals →</button>
            </div>

            <!-- Loading -->
            <div *ngIf="isLoading()" class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>

            <!-- Job Cards -->
            <div *ngIf="!isLoading()" class="space-y-4">
              <div *ngFor="let job of jobMatches()" 
                   class="group relative bg-slate-50 rounded-xl p-5 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all duration-300">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-4 flex-1">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm flex-shrink-0">
                      {{ job.company?.charAt(0) || 'C' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ job.title }}</h3>
                      <p class="text-slate-500 text-sm">{{ job.company }} · {{ job.location }}</p>
                      
                      <div *ngIf="job.aiAnalysis" class="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-800">
                        <span class="font-bold">⚡ AI:</span> {{ job.aiAnalysis | slice:0:80 }}{{ job.aiAnalysis.length > 80 ? '...' : '' }}
                      </div>

                      <div class="flex flex-wrap gap-1 mt-2">
                        <span *ngFor="let skill of job.skills?.slice(0, 3)" class="px-2 py-0.5 bg-white text-slate-600 text-xs rounded-full border border-slate-200">{{ skill }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                          [class]="job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' : job.matchScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'">
                      {{ job.matchScore }}%
                    </span>
                    <button (click)="applyToJob(job)" 
                            class="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-bold transition-colors disabled:opacity-60"
                            [disabled]="isApplying(job.id)">
                      {{ isApplying(job.id) ? '...' : 'Accept' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <app-empty-state
                *ngIf="jobMatches().length === 0"
                title="No referral matches yet"
                message="Your referral specialist is working on finding the best opportunities for you. Complete your profile to help them match you better."
                iconEmoji="🔓"
                actionLabel="Complete Profile"
                (action)="editProfile()"
                [variant]="'default'">
              </app-empty-state>
            </div>
          </div>

          <!-- Skill Gaps (Right 1/3) -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div class="flex items-center gap-2 mb-6">
              <span class="text-xl">📊</span>
              <h2 class="text-lg font-bold text-slate-800">Skills to Unlock More Jobs</h2>
            </div>

            <!-- Loading -->
            <div *ngIf="isLoadingGaps()" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>

            <!-- Skill Gap Items -->
            <div *ngIf="!isLoadingGaps()" class="space-y-3">
              <div *ngIf="skillGapData()?.matchableJobs !== undefined" class="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div class="text-sm text-blue-800">
                  You match <span class="font-bold">{{ skillGapData()?.matchableJobs }}</span> of <span class="font-bold">{{ skillGapData()?.totalJobs }}</span> available jobs
                </div>
                <div class="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 rounded-full transition-all duration-500" [style.width.%]="getMatchablePercent()"></div>
                </div>
              </div>

              <div *ngFor="let gap of skillGaps()" 
                   class="p-3 rounded-xl border transition-all hover:shadow-sm"
                   [class]="gap.impact === 'high' ? 'bg-red-50 border-red-100' : gap.impact === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'">
                <div class="flex justify-between items-center mb-1">
                  <span class="font-semibold text-sm text-slate-800">{{ gap.skill }}</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                        [class]="gap.impact === 'high' ? 'bg-red-100 text-red-700' : gap.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'">
                    {{ gap.impact === 'high' ? '🔥' : gap.impact === 'medium' ? '⚡' : '💡' }} +{{ gap.jobsUnlocked }} jobs
                  </span>
                </div>
                <div class="text-xs text-slate-500">
                  e.g. {{ gap.exampleJobs?.slice(0, 2).join(', ') }}
                </div>
              </div>

              <!-- Empty State -->
              <app-empty-state
                *ngIf="skillGaps().length === 0 && !isLoadingGaps()"
                title="Skills Analysis"
                message="Add skills to your profile to see gap analysis and unlock more jobs."
                iconEmoji="🎯"
                actionLabel="Add Skills"
                (action)="editProfile()"
                [variant]="'default'">
              </app-empty-state>
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
  isLoadingGaps = signal(true);
  profile = signal<CandidateProfile | null>(null);
  jobMatches = signal<JobMatch[]>([]);
  skillGaps = signal<SkillGap[]>([]);
  skillGapData = signal<SkillGapResponse | null>(null);
  applyingJobs = signal<Set<string>>(new Set());
  myReferralCount = signal<number>(0);

  ngOnInit() {
    console.log('Candidate dashboard init');
    const userRole = this.user()?.role;

    // Prevent loading candidate data if user is not a candidate (e.g. admin viewing page via some path)
    if (userRole !== 'candidate') {
      console.warn('Candidate Dashboard loaded for non-candidate role:', userRole);
      return;
    }

    this.loadProfile();
    this.loadJobMatches();
    this.loadSkillGaps();
    this.loadMyReferralCount();
  }

  loadMyReferralCount() {
    this.http.get<any[]>(`${environment.apiUrl}/referrals/my`).subscribe({
      next: (referrals) => this.myReferralCount.set(referrals.length),
      error: () => this.myReferralCount.set(0)
    });
  }

  loadProfile() {
    const userId = this.user()?.id;
    if (userId) {
      this.http.get<any>(`${environment.apiUrl}/candidates/user/${userId}`).subscribe({
        next: (data) => this.profile.set(data),
        error: () => {
          this.profile.set({
            firstName: this.user()?.firstName || '',
            lastName: this.user()?.lastName || '',
            email: this.user()?.email || '',
            skills: [], experience: 0, school: '', department: '', country: '', region: ''
          });
        }
      });
    }
  }

  loadJobMatches() {
    this.isLoading.set(true);
    this.http.get<JobMatch[]>(`${environment.apiUrl}/applications/recommended-jobs`).subscribe({
      next: (matches) => {
        this.jobMatches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.jobMatches.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadSkillGaps() {
    this.isLoadingGaps.set(true);
    this.http.get<SkillGapResponse>(`${environment.apiUrl}/job-discovery/skill-gaps`).subscribe({
      next: (data) => {
        this.skillGaps.set(data.gaps);
        this.skillGapData.set(data);
        this.isLoadingGaps.set(false);
      },
      error: () => {
        this.skillGaps.set([]);
        this.isLoadingGaps.set(false);
      }
    });
  }

  getMatchablePercent(): number {
    const data = this.skillGapData();
    if (!data || data.totalJobs === 0) return 0;
    return Math.round((data.matchableJobs / data.totalJobs) * 100);
  }

  isApplying(jobId: string): boolean {
    return this.applyingJobs().has(jobId);
  }

  applyToJob(job: JobMatch) {
    if (this.isApplying(job.id)) return;
    this.applyingJobs.update(set => { const s = new Set(set); s.add(job.id); return s; });

    this.http.post(`${environment.apiUrl}/applications/apply`, {
      jobId: job.id, aiMatchScore: job.matchScore
    }).subscribe({
      next: () => {
        alert(`Applied to ${job.title} at ${job.company}!`);
        this.applyingJobs.update(set => { const s = new Set(set); s.delete(job.id); return s; });
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to apply.');
        this.applyingJobs.update(set => { const s = new Set(set); s.delete(job.id); return s; });
      }
    });
  }

  getHighMatchCount(): number {
    return this.jobMatches().filter(j => j.matchScore >= 80).length;
  }

  navigateTo(path: string) { this.router.navigate([path]); }
  editProfile() { this.router.navigate(['/candidate/profile/edit']); }
  logout() { this.authService.logout(); }
}
