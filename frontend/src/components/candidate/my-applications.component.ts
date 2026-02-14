import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ApplicationService } from '../../services/application.service';
import { Application } from '../../models/application.model';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Pipeline -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ getStatusCount('applied') }}</div>
            <div class="text-xs text-slate-500 mt-1">Applied</div>
            <div class="mt-2 h-1 bg-blue-200 rounded-full"><div class="h-full bg-blue-500 rounded-full" [style.width.%]="getStatusPercent('applied')"></div></div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ getStatusCount('reviewing') }}</div>
            <div class="text-xs text-slate-500 mt-1">Reviewing</div>
            <div class="mt-2 h-1 bg-amber-200 rounded-full"><div class="h-full bg-amber-500 rounded-full" [style.width.%]="getStatusPercent('reviewing')"></div></div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
            <div class="text-2xl font-bold text-violet-600">{{ getStatusCount('interviewing') }}</div>
            <div class="text-xs text-slate-500 mt-1">Interviewing</div>
            <div class="mt-2 h-1 bg-violet-200 rounded-full"><div class="h-full bg-violet-500 rounded-full" [style.width.%]="getStatusPercent('interviewing')"></div></div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ getStatusCount('hired') }}</div>
            <div class="text-xs text-slate-500 mt-1">Hired</div>
            <div class="mt-2 h-1 bg-emerald-200 rounded-full"><div class="h-full bg-emerald-500 rounded-full" [style.width.%]="getStatusPercent('hired')"></div></div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
            <div class="text-2xl font-bold text-red-500">{{ getStatusCount('rejected') }}</div>
            <div class="text-xs text-slate-500 mt-1">Rejected</div>
            <div class="mt-2 h-1 bg-red-200 rounded-full"><div class="h-full bg-red-400 rounded-full" [style.width.%]="getStatusPercent('rejected')"></div></div>
          </div>
        </div>

        <!-- Applications List -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-xl font-bold text-slate-800">My Applications</h2>
            <p class="text-sm text-slate-500 mt-1">Track the status of all your job applications</p>
          </div>

          <!-- Loading -->
          <div *ngIf="isLoading()" class="flex justify-center py-16">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>

          <!-- Application Items -->
          <div *ngIf="!isLoading()">
            <div *ngFor="let app of applications(); let last = last" 
                 class="p-6 hover:bg-slate-50 transition-colors"
                 [class.border-b]="!last"
                 [class.border-slate-100]="!last">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <!-- Job Info -->
                <div class="flex items-start gap-4 flex-1">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm flex-shrink-0">
                    {{ app.job?.company?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800">{{ app.job?.title || 'Unknown Job' }}</h3>
                    <p class="text-sm text-slate-500">{{ app.job?.company }} · {{ app.job?.location }}</p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{{ app.job?.employmentType }}</span>
                      <span *ngIf="app.aiMatchScore">· AI Score: {{ app.aiMatchScore }}%</span>
                      <span>· Applied {{ getTimeAgo(app.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center gap-3">
                  <span class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                        [class]="getStatusClass(app.status)">
                    {{ getStatusIcon(app.status) }} {{ app.status }}
                  </span>
                </div>
              </div>

              <!-- Status Timeline -->
              <div class="mt-4 ml-16 hidden md:flex items-center gap-1">
                <div class="flex items-center gap-1" *ngFor="let step of statusSteps; let i = index; let isLast = last">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                       [class]="getStepIndex(app.status) >= i ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'">
                    {{ i + 1 }}
                  </div>
                  <span class="text-[10px] mr-2" [class]="getStepIndex(app.status) >= i ? 'text-blue-600 font-semibold' : 'text-slate-400'">
                    {{ step }}
                  </span>
                  <div *ngIf="!isLast" class="w-8 h-0.5" [class]="getStepIndex(app.status) > i ? 'bg-blue-500' : 'bg-slate-200'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading() && applications().length === 0" class="text-center py-16 px-6">
            <div class="text-4xl mb-4">📋</div>
            <h3 class="text-lg font-semibold text-slate-700 mb-1">No applications yet</h3>
            <p class="text-slate-500 text-sm mb-4">Start exploring jobs and apply to get started!</p>
            <button (click)="goToDiscover()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
              🔓 Discover Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(true);
  applications = signal<Application[]>([]);

  statusSteps = ['Applied', 'Reviewing', 'Interviewing', 'Hired'];

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.applicationService.getMyApplications().subscribe({
      next: (data) => {
        this.applications.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.applications.set([]);
        this.isLoading.set(false);
      }
    });
  }

  getStatusCount(status: string): number {
    return this.applications().filter(a => a.status === status).length;
  }

  getStatusPercent(status: string): number {
    const total = this.applications().length;
    return total === 0 ? 0 : (this.getStatusCount(status) / total) * 100;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'applied': 'bg-blue-100 text-blue-700 border border-blue-200',
      'reviewing': 'bg-amber-100 text-amber-700 border border-amber-200',
      'interviewing': 'bg-violet-100 text-violet-700 border border-violet-200',
      'hired': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'rejected': 'bg-red-100 text-red-600 border border-red-200'
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'applied': '📤',
      'reviewing': '👀',
      'interviewing': '🎤',
      'hired': '🎉',
      'rejected': '❌'
    };
    return map[status] || '📋';
  }

  getStepIndex(status: string): number {
    const order = ['applied', 'reviewing', 'interviewing', 'hired'];
    return order.indexOf(status);
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  goBack() { this.router.navigate(['/candidate/dashboard']); }
  goToDiscover() { this.router.navigate(['/candidate/jobs']); }
  logout() { this.authService.logout(); }
}
