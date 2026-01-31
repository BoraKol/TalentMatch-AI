import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Job, Candidate } from '../services/data.service';
import { GeminiService } from '../services/gemini.service';
import { ToastService } from '../services/toast.service';

interface AIMatchResult {
  candidateId: number;
  matchPercentage: number;
  analysis: string;
  strengths: string[];
  candidateDetails?: Candidate;
}

@Component({
  selector: 'app-job-match',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-8 pb-4">
        <h2 class="text-2xl font-bold text-slate-800">Job Matching & Analysis</h2>
        <p class="text-slate-500 mt-1">Select a job to run the AI matching algorithm against the candidate pool.</p>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-8 pt-0">
        
        <!-- Job List -->
        <div class="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Job Postings</div>
          @for (job of jobs; track job.id) {
            <div 
              (click)="selectJob(job)"
              class="group relative p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md"
              [class]="selectedJob()?.id === job.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'">
              
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg" [class.text-white]="selectedJob()?.id === job.id">{{ job.title }}</h3>
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  [class]="selectedJob()?.id === job.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
                  {{ job.type }}
                </span>
              </div>
              
              <p class="text-sm mb-4 line-clamp-2" [class]="selectedJob()?.id === job.id ? 'text-blue-100' : 'text-slate-500'">
                {{ job.description }}
              </p>

              <div class="flex flex-wrap gap-2">
                @for (skill of job.primarySkills; track skill) {
                  <span class="text-xs px-2 py-0.5 rounded border"
                    [class]="selectedJob()?.id === job.id ? 'border-white/30 text-white' : 'border-slate-200 text-slate-500 bg-slate-50'">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- AI Analysis Area -->
        <div class="w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          
          @if (!selectedJob()) {
            <div class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p class="text-lg font-medium text-slate-600">No Job Selected</p>
              <p>Select a job posting from the left to start the matching process.</p>
            </div>
          } @else {
            
            <!-- Top Bar Actions -->
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 class="font-bold text-slate-800 text-lg">Candidates for {{ selectedJob()?.title }}</h3>
                <p class="text-sm text-slate-500">Based on Algorithm Settings & AI Bio Analysis</p>
              </div>
              
              <button 
                (click)="runMatch()"
                [disabled]="isLoading()"
                class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Analysis...
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Find Top 3 Candidates
                }
              </button>
            </div>

            <!-- Results -->
            <div class="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              @if (results().length === 0 && !isLoading()) {
                <div class="h-full flex flex-col items-center justify-center text-slate-400">
                  <p>Click the button above to discover the best matches.</p>
                </div>
              }

              @if (results().length > 0) {
                <div class="space-y-6">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
                    <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Top 3 Matches Found</h4>
                  </div>

                  @for (match of results(); track match.candidateId) {
                    <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-start gap-4">
                        <img [src]="match.candidateDetails?.avatar || 'https://ui-avatars.com/api/?name=' + match.candidateDetails?.name" class="w-16 h-16 rounded-full object-cover border-2 border-slate-100">
                        
                        <div class="flex-1">
                          <div class="flex justify-between items-start">
                            <div>
                              <h4 class="text-lg font-bold text-slate-800">{{ match.candidateDetails?.name }}</h4>
                              <p class="text-sm text-slate-500 mb-2">
                                <span *ngIf="match.candidateDetails?.role" class="font-medium text-slate-700">{{ match.candidateDetails?.role }}</span>
                                <span *ngIf="match.candidateDetails?.role && match.candidateDetails?.experience" class="mx-1">•</span>
                                <span *ngIf="match.candidateDetails?.experience">{{ match.candidateDetails?.experience }} Years Exp</span>
                              </p>
                            </div>
                            <div class="flex flex-col items-end">
                              <div class="text-2xl font-black" [ngClass]="getScoreClass(match.matchPercentage)">{{ match.matchPercentage }}%</div>
                              <div class="text-xs font-bold text-slate-400 uppercase">Match Score</div>
                            </div>
                          </div>

                          <div class="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 mb-4">
                            <span class="font-bold mr-1">AI Analysis:</span> {{ match.analysis || 'No detailed analysis provided by AI.' }}
                          </div>

                          <div class="flex flex-wrap gap-2 mb-4">
                            @for (strength of match.strengths; track strength) {
                              <span class="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200 font-medium">
                                + {{ strength }}
                              </span>
                            }
                          </div>
                          
                          <div class="flex justify-end pt-2 border-t border-slate-100">
                             <button (click)="viewProfile(match.candidateDetails!)" class="text-sm font-medium text-blue-600 hover:text-blue-800 px-4 py-2 hover:bg-blue-50 rounded transition-colors">
                               View Full Profile
                             </button>
                             <button (click)="inviteToInterview(match.candidateDetails!)" class="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded ml-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                               Invite to Interview
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Profile Modal -->
      @if (selectedCandidateForView()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" (click)="closeProfile()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
              <h3 class="font-bold text-xl text-slate-800">Candidate Profile</h3>
              <button (click)="closeProfile()" class="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="p-8">
              <div class="flex items-start gap-6 mb-8">
                <img [src]="selectedCandidateForView()?.avatar || 'https://ui-avatars.com/api/?name=' + selectedCandidateForView()?.name" class="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-lg">
                <div>
                  <h2 class="text-3xl font-bold text-slate-800">{{ selectedCandidateForView()?.name }}</h2>
                  <p class="text-lg text-blue-600 font-medium mb-2">{{ selectedCandidateForView()?.role }}</p>
                  <div class="flex items-center gap-2 text-slate-500 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ selectedCandidateForView()?.experience }} Years Experience
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
                  <p class="text-slate-600 leading-relaxed">{{ selectedCandidateForView()?.bio }}</p>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
                  <div class="flex flex-wrap gap-2">
                    @for (skill of selectedCandidateForView()?.skills; track skill) {
                      <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              
              <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                 <button (click)="closeProfile()" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                   Close
                 </button>
                 <button (click)="inviteToInterview(selectedCandidateForView()!)" class="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-colors">
                   Invite to Interview
                 </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class JobMatchComponent {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);
  toastService = inject(ToastService);

  jobs = this.dataService.jobs;
  selectedJob = signal<Job | null>(null);
  isLoading = signal(false);
  results = signal<AIMatchResult[]>([]);
  selectedCandidateForView = signal<Candidate | null>(null);

  selectJob(job: Job) {
    this.selectedJob.set(job);
    this.results.set([]);
  }

  async runMatch() {
    const job = this.selectedJob();
    if (!job) return;

    this.isLoading.set(true);
    this.results.set([]);

    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 800));

    try {
      const candidates = this.dataService.candidates;
      const settings = this.dataService.algorithmSettings();

      const aiResults = await this.geminiService.findTopCandidates(job, candidates, settings);

      // Hydrate results with full candidate objects
      const finalResults = aiResults.map((res: any) => ({
        ...res,
        candidateDetails: candidates.find(c => c.id === res.candidateId)
      }));

      this.results.set(finalResults);

    } catch (err) {
      console.error(err);
      alert('Failed to generate matches. Please check your API Key.');
    } finally {
      this.isLoading.set(false);
    }
  }

  viewProfile(candidate: Candidate) {
    if (!candidate) return;
    this.selectedCandidateForView.set(candidate);
  }

  closeProfile() {
    this.selectedCandidateForView.set(null);
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-500';
  }

  async inviteToInterview(candidate: Candidate) {
    if (!candidate) return;

    // Call the real API
    this.toastService.show(`Sending invitation to ${candidate.name}...`, 'info');

    try {
      await this.dataService.inviteCandidate(candidate, this.selectedJob()?.title || 'Job Position');
      this.toastService.show(`Invitation sent to ${candidate.name}!`, 'success');
      this.closeProfile();
    } catch (error) {
      console.error(error);
      this.toastService.show(`Failed to send invitation.`, 'error');
    }
  }
}