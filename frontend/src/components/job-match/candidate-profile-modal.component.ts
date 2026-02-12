import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../services/data.service';

@Component({
    selector: 'app-candidate-profile-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" (click)="onClose()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
          <h3 class="font-bold text-xl text-slate-800">Candidate Profile</h3>
          <button (click)="onClose()" class="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-8">
          <div class="flex items-start gap-6 mb-8">
            <img [src]="candidate?.avatar || 'https://ui-avatars.com/api/?name=' + candidate?.name" class="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-lg">
            <div>
              <h2 class="text-3xl font-bold text-slate-800">{{ candidate?.name }}</h2>
              <p class="text-lg text-blue-600 font-medium mb-2">{{ candidate?.role }}</p>
              <div class="flex items-center gap-2 text-slate-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ candidate?.experience }} Years Experience
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
              <p class="text-slate-600 leading-relaxed">{{ candidate?.bio }}</p>
            </div>

            <div>
              <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
              <div class="flex flex-wrap gap-2">
                @for (skill of candidate?.skills; track skill) {
                  <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>
          </div>
          
          <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
             <button (click)="onClose()" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
               Close
             </button>
             <button (click)="onInvite()" class="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-colors">
               Invite to Interview
             </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidateProfileModalComponent {
    @Input({ required: true }) candidate: Candidate | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() invite = new EventEmitter<Candidate>();

    onClose() {
        this.close.emit();
    }

    onInvite() {
        if (this.candidate) {
            this.invite.emit(this.candidate);
        }
    }
}
