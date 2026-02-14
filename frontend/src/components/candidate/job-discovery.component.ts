import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ReferralService } from '../../services/referral.service';
import { ReferralPosition } from '../../models/referral.model';

@Component({
  selector: 'app-job-discovery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <button (click)="goBack()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="flex items-center gap-2">
                <span class="text-xl">🔓</span>
                <span class="font-bold text-xl text-slate-800">Referred Positions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Banner -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div class="relative z-10">
            <h1 class="text-3xl font-bold">🔓 Positions Referred to You</h1>
            <p class="text-amber-100 mt-2">Your referral specialist has matched you with these opportunities using AI analysis.</p>
            <div class="mt-4 flex items-center gap-4 text-sm">
              <span class="bg-white/20 px-3 py-1 rounded-full">{{ positions().length }} referrals</span>
              <span class="bg-white/20 px-3 py-1 rounded-full">{{ getPendingCount() }} pending response</span>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 mb-6">
          <button *ngFor="let f of filters" (click)="activeFilter = f.value"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  [class]="activeFilter === f.value ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'">
            {{ f.label }} ({{ getFilterCount(f.value) }})
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading()" class="flex justify-center py-16">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-3 border-amber-500 border-t-transparent mx-auto"></div>
            <p class="text-sm text-slate-500 mt-4">Loading your referrals...</p>
          </div>
        </div>

        <!-- Position Cards -->
        <div *ngIf="!isLoading()" class="space-y-4">
          <div *ngFor="let pos of filteredPositions()" 
               class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4 flex-1">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600 text-xl font-bold flex-shrink-0">
                  {{ pos.job?.company?.charAt(0) || '?' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-lg font-bold text-slate-800">{{ pos.job?.title }}</h3>
                    <span *ngIf="pos.status === 'pending'" class="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">⏳ Awaiting Your Response</span>
                    <span *ngIf="pos.status === 'accepted'" class="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">✅ Accepted</span>
                    <span *ngIf="pos.status === 'interviewing'" class="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">💬 Interviewing</span>
                    <span *ngIf="pos.status === 'hired'" class="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">🎉 Hired</span>
                    <span *ngIf="pos.status === 'declined'" class="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">❌ Declined</span>
                  </div>
                  <p class="text-sm text-slate-500 mt-1">{{ pos.job?.company }} · {{ pos.job?.location || 'Remote' }} · {{ pos.job?.employmentType }}</p>
                  
                  <div *ngIf="pos.aiAnalysis" class="mt-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                    <p class="text-xs text-amber-800">
                      <span class="font-bold">⚡ AI Analysis:</span> {{ pos.aiAnalysis }}
                    </p>
                  </div>

                  <div *ngIf="pos.job?.description" class="mt-2 text-sm text-slate-600 line-clamp-2">
                    {{ pos.job.description }}
                  </div>

                  <div class="flex flex-wrap gap-1.5 mt-3">
                    <span *ngFor="let skill of pos.job?.requiredSkills?.slice(0, 5)" 
                          class="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                      {{ skill }}
                    </span>
                  </div>

                  <p class="text-xs text-slate-400 mt-2">Referred {{ getTimeAgo(pos.referredAt) }}</p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-3 flex-shrink-0">
                <!-- Score -->
                <div class="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                     [class]="pos.aiMatchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                              pos.aiMatchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'">
                  <span class="text-lg font-black">{{ pos.aiMatchScore }}%</span>
                  <span class="text-[9px] uppercase font-medium">Match</span>
                </div>

                <!-- Action Buttons (only for pending) -->
                <div *ngIf="pos.status === 'pending'" class="flex flex-col gap-2">
                  <button (click)="respond(pos, 'accepted')"
                          [disabled]="responding().has(pos._id)"
                          class="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50">
                    {{ responding().has(pos._id) ? '...' : '✅ Accept' }}
                  </button>
                  <button (click)="respond(pos, 'declined')"
                          [disabled]="responding().has(pos._id)"
                          class="px-5 py-2 bg-white text-slate-600 text-sm font-medium rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredPositions().length === 0" class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div class="text-4xl mb-4">🔓</div>
            <h3 class="text-xl font-bold text-slate-700 mb-2">No referred positions yet</h3>
            <p class="text-slate-500 max-w-md mx-auto">Your referral specialist is analyzing your profile and finding the best opportunities. Make sure your profile is complete and up-to-date!</p>
            <button (click)="goBack()" class="mt-6 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobDiscoveryComponent implements OnInit {
  private referralService = inject(ReferralService);
  private router = inject(Router);

  positions = signal<ReferralPosition[]>([]);
  isLoading = signal(true);
  responding = signal<Set<string>>(new Set());
  activeFilter = 'all';

  filters = [
    { label: '📋 All', value: 'all' },
    { label: '⏳ Pending', value: 'pending' },
    { label: '✅ Accepted', value: 'accepted' },
    { label: '💬 Interviewing', value: 'interviewing' },
    { label: '🎉 Hired', value: 'hired' }
  ];

  ngOnInit() {
    this.loadReferrals();
  }

  loadReferrals() {
    this.isLoading.set(true);
    this.referralService.getMyReferrals().subscribe({
      next: (data) => {
        this.positions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load referrals:', err);
        this.positions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  filteredPositions(): ReferralPosition[] {
    if (this.activeFilter === 'all') return this.positions();
    return this.positions().filter(p => p.status === this.activeFilter);
  }

  getPendingCount(): number {
    return this.positions().filter(p => p.status === 'pending').length;
  }

  getFilterCount(status: string): number {
    if (status === 'all') return this.positions().length;
    return this.positions().filter(p => p.status === status).length;
  }

  respond(pos: ReferralPosition, action: 'accepted' | 'declined') {
    this.responding.update(s => { const ns = new Set(s); ns.add(pos._id); return ns; });

    this.referralService.respondToReferral(pos._id, action).subscribe({
      next: () => {
        this.positions.update(list =>
          list.map(p => p._id === pos._id ? { ...p, status: action } : p)
        );
        this.responding.update(s => { const ns = new Set(s); ns.delete(pos._id); return ns; });
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to respond');
        this.responding.update(s => { const ns = new Set(s); ns.delete(pos._id); return ns; });
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  goBack() {
    this.router.navigate(['/candidate/dashboard']);
  }
}
