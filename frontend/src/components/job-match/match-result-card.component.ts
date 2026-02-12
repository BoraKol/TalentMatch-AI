import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../services/data.service';

export interface AIMatchResult {
    candidateId: number;
    matchPercentage: number;
    analysis: string;
    strengths: string[];
    candidateDetails?: Candidate;
}

@Component({
    selector: 'app-match-result-card',
    standalone: true,
    imports: [CommonModule],
    template: `
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
             <button (click)="onViewProfile()" class="text-sm font-medium text-blue-600 hover:text-blue-800 px-4 py-2 hover:bg-blue-50 rounded transition-colors">
               View Full Profile
             </button>
             <button (click)="onInvite()" class="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded ml-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
               Invite to Interview
             </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MatchResultCardComponent {
    @Input({ required: true }) match!: AIMatchResult;
    @Output() viewProfile = new EventEmitter<Candidate>();
    @Output() invite = new EventEmitter<Candidate>();

    getScoreClass(score: number): string {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-500';
    }

    onViewProfile() {
        if (this.match.candidateDetails) {
            this.viewProfile.emit(this.match.candidateDetails);
        }
    }

    onInvite() {
        if (this.match.candidateDetails) {
            this.invite.emit(this.match.candidateDetails);
        }
    }
}
