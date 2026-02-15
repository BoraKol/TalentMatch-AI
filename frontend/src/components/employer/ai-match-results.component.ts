import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  email: string;
  matchPercentage: number;
  analysis: string;
  strengths: string[];
  skills: string[];
  experience: number;
  school?: string;
  department?: string;
  bio?: string;
  scoreBreakdown?: {
    primary: number;
    secondary: number;
    soft: number;
    total: number;
    maxPossible: number;
  };
}

interface MatchResult {
  job: {
    id: string;
    title: string;
    company: string;
  };
  matches: CandidateMatch[];
  analyzedAt: Date;
}

@Component({
  selector: 'app-ai-match-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 pt-4">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white">AI Candidate Matches</h1>
              <p class="text-slate-400 mt-1">
                @if (result()) {
                  Top matches for <span class="text-purple-400 font-semibold">{{ result()?.job?.title }}</span> at {{ result()?.job?.company }}
                }
              </p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-12">
            <div class="text-center">
              <div class="relative w-24 h-24 mx-auto mb-6">
                <div class="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                <div class="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
              </div>
              <h2 class="text-2xl font-bold text-white mb-2">AI is Analyzing Candidates</h2>
              <p class="text-slate-400">Finding the best matches for your job posting...</p>
              <div class="flex justify-center gap-1 mt-4">
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-900/30 backdrop-blur-xl rounded-3xl border border-red-500/50 p-8 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
            <p class="text-red-300">{{ error() }}</p>
            <button (click)="retry()" class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
              Try Again
            </button>
          </div>
        }

        <!-- Results -->
        @if (!isLoading() && !error() && result()) {
          <!-- Stats Bar -->
          <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 mb-6 flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ result()?.matches?.length || 0 }}</div>
                <div class="text-xs text-slate-400">Top Matches</div>
              </div>
              <div class="w-px h-10 bg-slate-700"></div>
              <div class="text-center">
                <div class="text-2xl font-bold text-emerald-400">{{ getAvgMatch() }}%</div>
                <div class="text-xs text-slate-400">Avg Match</div>
              </div>
            </div>
            <button (click)="retry()" class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg font-medium transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Re-analyze
            </button>
          </div>

          <!-- Candidate Cards -->
          <div class="space-y-6">
            @for (candidate of result()?.matches; track candidate.candidateId; let i = $index) {
              <div class="group relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                <!-- Rank Badge -->
                <div class="absolute top-4 left-4 z-10">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg"
                       [class]="i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900' : 
                                i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700' :
                                'bg-gradient-to-br from-amber-600 to-orange-700 text-amber-100'">
                    #{{ i + 1 }}
                  </div>
                </div>

                <div class="p-6 pl-20">
                  <div class="flex flex-col lg:flex-row lg:items-start gap-6">
                    <!-- Candidate Info -->
                    <div class="flex-1">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                          {{ getInitials(candidate.candidateName) }}
                        </div>
                        <div>
                          <h3 class="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {{ candidate.candidateName }}
                          </h3>
                          <p class="text-slate-400 text-sm">{{ candidate.email }}</p>
                          @if (candidate.school || candidate.department) {
                            <p class="text-slate-500 text-sm">{{ candidate.school }} {{ candidate.department ? '• ' + candidate.department : '' }}</p>
                          }
                        </div>
                      </div>

                      <!-- Score Breakdown -->
                      @if (candidate.scoreBreakdown) {
                        <div class="mb-4 grid grid-cols-3 gap-3">
                          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Primary</p>
                            <p class="text-lg font-bold text-white">{{ candidate.scoreBreakdown.primary }}</p>
                            <p class="text-[10px] text-slate-500">10 pts/match</p>
                          </div>
                          <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                            <p class="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Secondary</p>
                            <p class="text-lg font-bold text-white">{{ candidate.scoreBreakdown.secondary }}</p>
                            <p class="text-[10px] text-slate-500">5 pts/match</p>
                          </div>
                          <div class="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                            <p class="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Soft Skills</p>
                            <p class="text-lg font-bold text-white">{{ candidate.scoreBreakdown.soft }}</p>
                            <p class="text-[10px] text-slate-500">2 pts/match</p>
                          </div>
                        </div>
                      }

                      <!-- AI Analysis (Expandable) -->
                      <div class="bg-slate-900/50 rounded-xl overflow-hidden mb-4">
                        <button (click)="toggleAnalysis(candidate.candidateId)" 
                                class="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                              </svg>
                            </div>
                            <div class="text-left">
                              <p class="text-xs font-medium text-purple-400 uppercase tracking-wider">AI Analysis</p>
                              <p class="text-slate-400 text-xs mt-0.5">
                                {{ isAnalysisExpanded(candidate.candidateId) ? 'Click to collapse' : 'Click to expand detailed analysis' }}
                              </p>
                            </div>
                          </div>
                          <svg class="w-5 h-5 text-slate-400 transition-transform duration-300"
                               [class.rotate-180]="isAnalysisExpanded(candidate.candidateId)"
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                        
                        <!-- Expandable Content -->
                        <div class="overflow-hidden transition-all duration-300 ease-in-out"
                             [style.max-height]="isAnalysisExpanded(candidate.candidateId) ? '500px' : '0'"
                             [style.opacity]="isAnalysisExpanded(candidate.candidateId) ? '1' : '0'">
                          <div class="px-4 pb-4 pt-0">
                            <div class="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                              <!-- Candidate Bio -->
                              @if (candidate.bio) {
                                <div class="mb-4 pb-4 border-b border-slate-700">
                                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Candidate Bio</p>
                                  <p class="text-slate-300 text-sm italic">{{ candidate.bio }}</p>
                                </div>
                              }

                              <p class="text-slate-500 uppercase tracking-wider mb-2 text-xs font-bold">AI Analysis</p>
                              <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ candidate.analysis }}</p>
                              
                              <!-- Additional AI Insights -->
                              <div class="mt-4 pt-4 border-t border-slate-700">
                                <div class="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <p class="text-slate-500 uppercase tracking-wider mb-1">Key Strengths</p>
                                    <div class="flex flex-wrap gap-1">
                                      @for (strength of candidate.strengths?.slice(0, 3); track strength) {
                                        <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">{{ strength }}</span>
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <p class="text-slate-500 uppercase tracking-wider mb-1">Experience Level</p>
                                    <p class="text-slate-300">{{ candidate.experience || 0 }} years</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Skills & Strengths -->
                      <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Matching Skills</p>
                        <div class="flex flex-wrap gap-2">
                          @for (strength of candidate.strengths; track strength) {
                            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium">
                              {{ strength }}
                            </span>
                          }
                          @for (skill of getOtherSkills(candidate); track skill) {
                            <span class="px-3 py-1 rounded-full bg-slate-700 text-slate-400 text-sm">
                              {{ skill }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Match Score & Actions -->
                    <div class="lg:w-48 flex-shrink-0">
                      <div class="text-center mb-4">
                        <div class="relative w-28 h-28 mx-auto">
                          <svg class="w-28 h-28 transform -rotate-90">
                            <circle cx="56" cy="56" r="50" stroke="currentColor" stroke-width="8" fill="none" class="text-slate-700"/>
                            <circle cx="56" cy="56" r="50" stroke="currentColor" stroke-width="8" fill="none" 
                                    [class]="getScoreColor(candidate.matchPercentage)"
                                    [style.stroke-dasharray]="'314'"
                                    [style.stroke-dashoffset]="314 - (314 * candidate.matchPercentage / 100)"
                                    style="transition: stroke-dashoffset 1s ease-out"/>
                          </svg>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-3xl font-bold" [class]="getScoreTextColor(candidate.matchPercentage)">{{ candidate.matchPercentage }}%</span>
                          </div>
                        </div>
                        <p class="text-sm mt-2" [class]="getScoreLabelColor(candidate.matchPercentage)">
                          {{ getMatchLabel(candidate.matchPercentage) }}
                        </p>
                      </div>

                      <!-- Actions -->
                      <div class="space-y-2">
                        <button (click)="openContactModal(candidate)" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20">
                          Contact Candidate
                        </button>
                        <button [routerLink]="['/employer/candidates', candidate.candidateId]" class="w-full py-2 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Decorative gradient -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            }

            @if (result()?.matches?.length === 0) {
              <div class="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-12 text-center">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">No Matching Candidates Found</h3>
                <p class="text-slate-400 mb-6">There are no candidates in the pool that match this job's requirements.</p>
                <a routerLink="/employer/dashboard" class="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
                  Return to Dashboard
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Contact Modal -->
    @if (showContactModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeContactModal()">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-slate-800 rounded-3xl border border-slate-700 w-full max-w-lg shadow-2xl" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Contact Candidate</h3>
                  <p class="text-sm text-slate-400">Send a message to {{ selectedCandidate()?.candidateName }}</p>
                </div>
              </div>
              <button (click)="closeContactModal()" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <input type="text" [(ngModel)]="contactSubject" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                     placeholder="Enter email subject...">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea [(ngModel)]="contactMessage" rows="5"
                        class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                        placeholder="Write your message to the candidate..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                <input type="text" [(ngModel)]="senderName" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                       placeholder="John Doe">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
                <input type="email" [(ngModel)]="senderEmail" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                       placeholder="john@company.com">
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-slate-700 flex gap-3">
            <button (click)="closeContactModal()" 
                    class="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">
              Cancel
            </button>
            <button (click)="sendContactEmail()" 
                    [disabled]="isSendingEmail()"
                    class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (isSendingEmail()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Send Email
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Success Toast -->
    @if (showSuccessToast()) {
      <div class="fixed bottom-6 right-6 z-50 animate-slide-up">
        <div class="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="font-medium">Email sent successfully!</span>
        </div>
      </div>
    }
  `
})
export class AiMatchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoading = signal(true);
  error = signal('');
  result = signal<MatchResult | null>(null);

  // Contact Modal State
  showContactModal = signal(false);
  selectedCandidate = signal<CandidateMatch | null>(null);
  isSendingEmail = signal(false);
  showSuccessToast = signal(false);

  // Expanded Analysis State
  expandedAnalysis = new Set<string>();

  // Form fields
  contactSubject = '';
  contactMessage = '';
  senderName = '';
  senderEmail = '';

  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (jobId) {
      this.findMatches(jobId);
    } else {
      this.error.set('No job ID provided');
      this.isLoading.set(false);
    }
  }

  findMatches(jobId: string, forceRefresh: boolean = false) {
    this.isLoading.set(true);
    this.error.set('');

    this.http.get<MatchResult>(`${environment.apiUrl}/employers/jobs/${jobId}/matches${forceRefresh ? '?forceRefresh=true' : ''}`).subscribe({
      next: (data) => {
        this.result.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to analyze candidates');
        this.isLoading.set(false);
      }
    });
  }

  retry() {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (jobId) {
      // Force refresh when user clicks Re-analyze
      this.findMatches(jobId, true);
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvgMatch(): number {
    const matches = this.result()?.matches || [];
    if (matches.length === 0) return 0;
    const sum = matches.reduce((acc, m) => acc + m.matchPercentage, 0);
    return Math.round(sum / matches.length);
  }

  getOtherSkills(candidate: CandidateMatch): string[] {
    const strengths = candidate.strengths || [];
    return (candidate.skills || []).filter(s => !strengths.includes(s)).slice(0, 3);
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 75) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-red-500';
  }

  getScoreTextColor(percentage: number): string {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  getScoreLabelColor(percentage: number): string {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  getMatchLabel(percentage: number): string {
    if (percentage >= 75) return 'Strong Match';
    if (percentage >= 50) return 'Good Match';
    return 'Weak Match';
  }

  // Analysis Expand/Collapse Methods
  toggleAnalysis(candidateId: string) {
    if (this.expandedAnalysis.has(candidateId)) {
      this.expandedAnalysis.delete(candidateId);
    } else {
      this.expandedAnalysis.add(candidateId);
    }
  }

  isAnalysisExpanded(candidateId: string): boolean {
    return this.expandedAnalysis.has(candidateId);
  }

  // Contact Modal Methods
  openContactModal(candidate: CandidateMatch) {
    this.selectedCandidate.set(candidate);
    this.contactSubject = `Opportunity: ${this.result()?.job?.title} at ${this.result()?.job?.company}`;
    this.contactMessage = `Hi ${candidate.candidateName},\n\nI came across your profile on TalentMatch AI and was impressed by your skills in ${candidate.strengths.slice(0, 3).join(', ')}.\n\nWe have an exciting opportunity for ${this.result()?.job?.title} at ${this.result()?.job?.company} that I believe would be a great fit for your experience.\n\nWould you be interested in learning more about this role?\n\nBest regards`;

    // Auto-fill sender info from logged-in user
    const user = this.authService.currentUser();
    if (user) {
      this.senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Hiring Manager';
      this.senderEmail = user.email || '';
    }

    this.showContactModal.set(true);
  }

  closeContactModal() {
    this.showContactModal.set(false);
    this.selectedCandidate.set(null);
  }

  sendContactEmail() {
    const candidate = this.selectedCandidate();
    if (!candidate || !this.contactSubject || !this.contactMessage || !this.senderName || !this.senderEmail) {
      return;
    }

    this.isSendingEmail.set(true);

    const payload = {
      candidateId: candidate.candidateId,
      jobId: this.result()?.job?.id,
      subject: this.contactSubject,
      message: this.contactMessage,
      senderName: this.senderName,
      senderEmail: this.senderEmail,
      companyName: this.result()?.job?.company || 'Company'
    };

    this.http.post(`${environment.apiUrl}/contact/candidate`, payload).subscribe({
      next: (response: any) => {
        this.isSendingEmail.set(false);
        this.closeContactModal();
        this.showSuccessToast.set(true);

        // Hide toast after 3 seconds
        setTimeout(() => {
          this.showSuccessToast.set(false);
        }, 3000);

        // Log preview URL if available (for Ethereal test emails)
        if (response.previewUrl) {
          console.log('📧 Email Preview:', response.previewUrl);
        }
      },
      error: (err) => {
        this.isSendingEmail.set(false);
        console.error('Failed to send email:', err);
        alert('Failed to send email. Please try again.');
      }
    });
  }
}

