import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface CandidateItem {
    _id: string;
    name: string;
    email: string;
    title: string;
    skills: string[];
    experience: number;
    school: string;
    department: string;
}

interface JobMatchItem {
    id: string;
    title: string;
    company: string;
    matchScore: number;
    aiAnalysis: string;
    location: string;
    type: string;
    isReferred: boolean;
    referralStatus: string | null;
}

interface ReferralItem {
    _id: string;
    candidate: { firstName: string; lastName: string; currentTitle: string; skills: string[] };
    job: { title: string; company: string; location: string };
    status: string;
    aiMatchScore: number;
    aiAnalysis: string;
    notes: string;
    referredAt: string;
}

@Component({
    selector: 'app-referral-hub',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-8 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-slate-800">🔓 Referral Hub</h1>
              <p class="text-slate-500 mt-0.5">Unlocking Hidden Jobs — Match candidates with the perfect opportunities</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="activeTab = 'match'" 
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  [class]="activeTab === 'match' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'">
            🎯 Match & Refer
          </button>
          <button (click)="activeTab = 'history'; loadReferrals()" 
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  [class]="activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'">
            📋 Referral History
          </button>
        </div>
      </div>

      <!-- Match & Refer Tab -->
      <div *ngIf="activeTab === 'match'">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Left Panel: Candidate List -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50">
              <h3 class="text-lg font-bold text-slate-800 mb-3">Select Candidate</h3>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" [(ngModel)]="searchQuery" (input)="searchCandidates()" 
                       placeholder="Search by name, skill, or title..."
                       class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              </div>
            </div>
            <div class="max-h-[600px] overflow-y-auto">
              <div *ngIf="candidatesLoading()" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-3 border-indigo-500 border-t-transparent"></div>
              </div>
              <div *ngFor="let c of candidates()" 
                   (click)="selectCandidate(c)"
                   class="p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-indigo-50/50"
                   [class.bg-indigo-50]="selectedCandidate()?._id === c._id"
                   [class.border-l-4]="selectedCandidate()?._id === c._id"
                   [class.border-l-indigo-600]="selectedCandidate()?._id === c._id">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ c.name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 text-sm">{{ c.name }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ c.title }}</p>
                    <div class="flex flex-wrap gap-1 mt-1.5">
                      <span *ngFor="let skill of c.skills.slice(0, 3)" 
                            class="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-full">
                        {{ skill }}
                      </span>
                      <span *ngIf="c.skills.length > 3" class="text-[10px] text-slate-400">+{{ c.skills.length - 3 }}</span>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-400">{{ c.experience }}y exp</span>
                </div>
              </div>
              <div *ngIf="!candidatesLoading() && candidates().length === 0" class="text-center py-12 text-slate-400">
                <p class="text-sm">No candidates found</p>
              </div>
            </div>
          </div>

          <!-- Right Panel: AI Matches -->
          <div class="lg:col-span-3">
            <!-- No candidate selected -->
            <div *ngIf="!selectedCandidate()" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">Select a Candidate</h3>
              <p class="text-slate-500 text-sm">Choose a candidate from the left panel to see AI-matched job opportunities</p>
            </div>

            <!-- Candidate selected -->
            <div *ngIf="selectedCandidate()">
              <!-- Candidate Info Banner -->
              <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {{ selectedCandidate()!.name.charAt(0) }}
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-bold">{{ selectedCandidate()!.name }}</h3>
                    <p class="text-indigo-200">{{ selectedCandidate()!.title }} · {{ selectedCandidate()!.experience }} years experience</p>
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      <span *ngFor="let skill of selectedCandidate()!.skills.slice(0, 6)" 
                            class="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                        {{ skill }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI Matches -->
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 class="text-lg font-bold text-slate-800">🤖 AI-Matched Jobs</h3>
                  <span class="text-xs text-slate-400">{{ matches().length }} matches found</span>
                </div>

                <div *ngIf="matchesLoading()" class="flex justify-center py-12">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent mx-auto"></div>
                    <p class="text-sm text-slate-500 mt-3">Running AI analysis with Gemini...</p>
                  </div>
                </div>

                <div *ngIf="!matchesLoading()" class="divide-y divide-slate-50">
                  <div *ngFor="let match of matches()" class="p-4 hover:bg-slate-50/50 transition-colors">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h4 class="font-semibold text-slate-800">{{ match.title }}</h4>
                          <span *ngIf="match.matchScore >= 80" class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            🔥 Strong Match
                          </span>
                        </div>
                        <p class="text-sm text-slate-500 mt-0.5">{{ match.company }} · {{ match.location || 'Remote' }}</p>
                        <p *ngIf="match.aiAnalysis" class="text-xs text-slate-400 mt-1 line-clamp-2">
                          ⚡ {{ match.aiAnalysis }}
                        </p>
                      </div>
                      <div class="flex items-center gap-3 flex-shrink-0">
                        <!-- Score Badge -->
                        <div class="text-center">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                               [class]="match.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                        match.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-600'">
                            {{ match.matchScore }}%
                          </div>
                        </div>
                        <!-- Refer Button -->
                        <button *ngIf="!match.isReferred"
                                (click)="refer(match)"
                                [disabled]="isReferring(match.id)"
                                class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50">
                          {{ isReferring(match.id) ? '...' : '🔓 Refer' }}
                        </button>
                        <span *ngIf="match.isReferred" 
                              class="px-3 py-1.5 text-xs font-medium rounded-xl"
                              [class]="match.referralStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                       match.referralStatus === 'declined' ? 'bg-red-100 text-red-700' :
                                       match.referralStatus === 'interviewing' ? 'bg-blue-100 text-blue-700' :
                                       match.referralStatus === 'hired' ? 'bg-purple-100 text-purple-700' :
                                       'bg-slate-100 text-slate-600'">
                          {{ getStatusLabel(match.referralStatus || 'pending') }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="matches().length === 0" class="text-center py-12 text-slate-400">
                    <p class="text-sm">No AI matches found for this candidate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Referral History Tab -->
      <div *ngIf="activeTab === 'history'">
        <!-- Status Filter -->
        <div class="flex gap-2 mb-6">
          <button *ngFor="let s of statusFilters" (click)="filterStatus = s.value; loadReferrals()"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  [class]="filterStatus === s.value ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'">
            {{ s.label }}
          </button>
        </div>

        <!-- Referral Cards -->
        <div *ngIf="referralsLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent"></div>
        </div>
        <div *ngIf="!referralsLoading()" class="space-y-3">
          <div *ngFor="let ref of referrals()" 
               class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {{ ref.candidate?.firstName?.charAt(0) || '?' }}
                </div>
                <div>
                  <p class="font-semibold text-slate-800">
                    {{ ref.candidate?.firstName }} {{ ref.candidate?.lastName }}
                    <span class="text-slate-400 font-normal mx-2">→</span>
                    {{ ref.job?.title }} @ {{ ref.job?.company }}
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ ref.job?.location }} · Referred {{ getTimeAgo(ref.referredAt) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {{ ref.aiMatchScore }}% match
                </span>
                <!-- Status Dropdown -->
                <select (change)="updateStatus(ref._id, $event)"
                        [value]="ref.status"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        [class]="ref.status === 'hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                 ref.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' :
                                 ref.status === 'interviewing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                 ref.status === 'accepted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                 'bg-slate-50 text-slate-600'">
                  <option value="pending">⏳ Pending</option>
                  <option value="accepted">✅ Accepted</option>
                  <option value="interviewing">💬 Interviewing</option>
                  <option value="hired">🎉 Hired</option>
                  <option value="declined">❌ Declined</option>
                </select>
              </div>
            </div>
            <p *ngIf="ref.aiAnalysis" class="text-xs text-slate-400 mt-2 pl-16">⚡ {{ ref.aiAnalysis }}</p>
          </div>
          <div *ngIf="referrals().length === 0" class="text-center py-12 text-slate-400 bg-white rounded-xl">
            <p class="text-lg mb-1">No referrals yet</p>
            <p class="text-sm">Go to "Match & Refer" to start making referrals</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReferralHubComponent implements OnInit {
    private http = inject(HttpClient);

    activeTab: 'match' | 'history' = 'match';
    searchQuery = '';
    filterStatus = 'all';

    candidates = signal<CandidateItem[]>([]);
    candidatesLoading = signal(false);
    selectedCandidate = signal<CandidateItem | null>(null);

    matches = signal<JobMatchItem[]>([]);
    matchesLoading = signal(false);

    referrals = signal<ReferralItem[]>([]);
    referralsLoading = signal(false);

    private referringIds = signal<Set<string>>(new Set());

    statusFilters = [
        { label: '📋 All', value: 'all' },
        { label: '⏳ Pending', value: 'pending' },
        { label: '✅ Accepted', value: 'accepted' },
        { label: '💬 Interviewing', value: 'interviewing' },
        { label: '🎉 Hired', value: 'hired' },
        { label: '❌ Declined', value: 'declined' }
    ];

    ngOnInit() {
        this.loadCandidates();
    }

    loadCandidates() {
        this.candidatesLoading.set(true);
        const url = this.searchQuery
            ? `${environment.apiUrl}/referrals/candidates?search=${encodeURIComponent(this.searchQuery)}`
            : `${environment.apiUrl}/referrals/candidates`;

        this.http.get<CandidateItem[]>(url).subscribe({
            next: (data) => {
                this.candidates.set(data);
                this.candidatesLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load candidates:', err);
                this.candidatesLoading.set(false);
            }
        });
    }

    searchCandidates() {
        this.loadCandidates();
    }

    selectCandidate(candidate: CandidateItem) {
        this.selectedCandidate.set(candidate);
        this.matchesLoading.set(true);

        this.http.get<any>(`${environment.apiUrl}/referrals/matches/${candidate._id}`).subscribe({
            next: (data) => {
                this.matches.set(data.matches || []);
                this.matchesLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load matches:', err);
                this.matchesLoading.set(false);
            }
        });
    }

    refer(match: JobMatchItem) {
        const candidate = this.selectedCandidate();
        if (!candidate) return;

        this.referringIds.update(s => { const ns = new Set(s); ns.add(match.id); return ns; });

        this.http.post(`${environment.apiUrl}/referrals`, {
            candidateId: candidate._id,
            jobId: match.id,
            aiMatchScore: match.matchScore,
            aiAnalysis: match.aiAnalysis || ''
        }).subscribe({
            next: () => {
                // Mark as referred in UI
                this.matches.update(list => list.map(m =>
                    m.id === match.id ? { ...m, isReferred: true, referralStatus: 'pending' } : m
                ));
                this.referringIds.update(s => { const ns = new Set(s); ns.delete(match.id); return ns; });
            },
            error: (err) => {
                alert(err.error?.error || 'Failed to create referral');
                this.referringIds.update(s => { const ns = new Set(s); ns.delete(match.id); return ns; });
            }
        });
    }

    isReferring(id: string): boolean {
        return this.referringIds().has(id);
    }

    loadReferrals() {
        this.referralsLoading.set(true);
        const url = this.filterStatus === 'all'
            ? `${environment.apiUrl}/referrals`
            : `${environment.apiUrl}/referrals?status=${this.filterStatus}`;

        this.http.get<ReferralItem[]>(url).subscribe({
            next: (data) => {
                this.referrals.set(data);
                this.referralsLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load referrals:', err);
                this.referralsLoading.set(false);
            }
        });
    }

    updateStatus(referralId: string, event: Event) {
        const status = (event.target as HTMLSelectElement).value;
        this.http.patch(`${environment.apiUrl}/referrals/${referralId}/status`, { status }).subscribe({
            next: () => {
                this.referrals.update(list =>
                    list.map(r => r._id === referralId ? { ...r, status } : r)
                );
            },
            error: (err) => alert(err.error?.error || 'Failed to update status')
        });
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: '⏳ Pending',
            accepted: '✅ Accepted',
            interviewing: '💬 Interviewing',
            hired: '🎉 Hired',
            declined: '❌ Declined'
        };
        return labels[status] || status;
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
}
