import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ApplicationService } from '../../services/application.service';
import { environment } from '../../environments/environment';

interface SavedJobItem {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    salaryRange?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experienceRequired: number;
    description: string;
    isActive: boolean;
    createdAt: string;
  };
  savedAt: string;
}

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">TM</div>
              <span class="font-bold text-xl text-slate-800">TalentMatch AI</span>
              <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Saved Jobs</span>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="goBack()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">← Dashboard</button>
              <button (click)="logout()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Title -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">🔖 Saved Jobs</h1>
            <p class="text-sm text-slate-500 mt-1">{{ savedJobs().length }} job{{ savedJobs().length !== 1 ? 's' : '' }} saved for later</p>
          </div>
          <button (click)="goToDiscover()" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md">
            🔓 Discover More
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading()" class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <!-- Jobs Grid -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let item of savedJobs()" 
               class="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col"
               [class.opacity-60]="!item.job?.isActive">
            
            <!-- Inactive badge -->
            <div *ngIf="!item.job?.isActive" class="mb-3 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full inline-block w-fit border border-red-200">
              ⚠ Position Closed
            </div>

            <!-- Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                {{ item.job?.company?.charAt(0) || '?' }}
              </div>
              <span class="text-xs text-slate-400">Saved {{ getTimeAgo(item.savedAt) }}</span>
            </div>

            <!-- Job Info -->
            <div class="mb-4 flex-grow">
              <h3 class="font-bold text-lg text-slate-800 line-clamp-2 mb-1">{{ item.job?.title }}</h3>
              <p class="text-slate-500 font-medium text-sm">{{ item.job?.company }}</p>
              
              <div class="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
                <span class="bg-slate-50 px-2 py-1 rounded border border-slate-100">📍 {{ item.job?.location }}</span>
                <span class="bg-slate-50 px-2 py-1 rounded border border-slate-100">⏰ {{ item.job?.employmentType }}</span>
                <span *ngIf="item.job?.salaryRange" class="bg-green-50 px-2 py-1 rounded border border-green-100 text-green-700">💰 {{ item.job?.salaryRange }}</span>
              </div>
            </div>

            <!-- Skills -->
            <div *ngIf="item.job?.requiredSkills?.length" class="mb-4">
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let skill of item.job.requiredSkills.slice(0, 4)" 
                      class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                  {{ skill }}
                </span>
                <span *ngIf="item.job.requiredSkills.length > 4" class="text-xs text-slate-400 self-center">+{{ item.job.requiredSkills.length - 4 }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button (click)="removeSaved(item)" 
                      class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
              <button *ngIf="item.job?.isActive" (click)="applyToJob(item)" 
                      class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      [disabled]="applyingJobs().has(item.job._id)">
                {{ applyingJobs().has(item.job._id) ? 'Applying...' : 'Apply Now' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && savedJobs().length === 0" class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div class="text-4xl mb-4">🔖</div>
          <h3 class="text-lg font-semibold text-slate-700 mb-1">No saved jobs yet</h3>
          <p class="text-slate-500 text-sm mb-4">Browse and save jobs you're interested in for later review.</p>
          <button (click)="goToDiscover()" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
            🔓 Discover Jobs
          </button>
        </div>
      </div>
    </div>
  `
})
export class SavedJobsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private applicationService = inject(ApplicationService);
  private router = inject(Router);

  isLoading = signal(true);
  savedJobs = signal<SavedJobItem[]>([]);
  applyingJobs = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadSavedJobs();
  }

  loadSavedJobs() {
    this.isLoading.set(true);
    this.http.get<SavedJobItem[]>(`${environment.apiUrl}/saved-jobs`).subscribe({
      next: (data) => {
        this.savedJobs.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.savedJobs.set([]);
        this.isLoading.set(false);
      }
    });
  }

  removeSaved(item: SavedJobItem) {
    this.http.delete(`${environment.apiUrl}/saved-jobs/${item.job._id}`).subscribe({
      next: () => {
        this.savedJobs.update(jobs => jobs.filter(j => j._id !== item._id));
      }
    });
  }

  applyToJob(item: SavedJobItem) {
    const jobId = item.job._id;
    if (this.applyingJobs().has(jobId)) return;

    this.applyingJobs.update(set => { const s = new Set(set); s.add(jobId); return s; });

    this.applicationService.applyForJob(jobId).subscribe({
      next: () => {
        alert(`Applied to ${item.job.title}!`);
        this.applyingJobs.update(set => { const s = new Set(set); s.delete(jobId); return s; });
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to apply');
        this.applyingJobs.update(set => { const s = new Set(set); s.delete(jobId); return s; });
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  }

  goBack() { this.router.navigate(['/candidate/dashboard']); }
  goToDiscover() { this.router.navigate(['/candidate/jobs']); }
  logout() { this.authService.logout(); }
}
