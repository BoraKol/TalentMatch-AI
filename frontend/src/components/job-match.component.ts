import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Job, Candidate } from '../services/data.service';
import { GeminiService } from '../services/gemini.service';
import { ToastService } from '../services/toast.service';
import { JobListComponent } from './job-match/job-list.component';
import { MatchResultCardComponent, AIMatchResult } from './job-match/match-result-card.component';
import { CandidateProfileModalComponent } from './job-match/candidate-profile-modal.component';

@Component({
  selector: 'app-job-match',
  standalone: true,
  imports: [CommonModule, JobListComponent, MatchResultCardComponent, CandidateProfileModalComponent],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-8 pb-4">
        <h2 class="text-2xl font-bold text-slate-800">Job Matching & Analysis</h2>
        <p class="text-slate-500 mt-1">Select a job to run the AI matching algorithm against the candidate pool.</p>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-6 p-8 pt-0 lg:overflow-hidden overflow-y-auto">
        
        <!-- Job List -->
        <div class="w-full lg:w-1/3">
            <app-job-list 
                [jobs]="jobs()" 
                [selectedJob]="selectedJob()" 
                (selectJob)="selectJob($event)">
            </app-job-list>
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
                    <app-match-result-card 
                        [match]="match" 
                        (viewProfile)="viewProfile($event)" 
                        (invite)="inviteToInterview($event)">
                    </app-match-result-card>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Profile Modal -->
      @if (selectedCandidateForView()) {
        <app-candidate-profile-modal 
            [candidate]="selectedCandidateForView()" 
            (close)="closeProfile()" 
            (invite)="inviteToInterview($event)">
        </app-candidate-profile-modal>
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