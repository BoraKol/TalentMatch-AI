import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../services/data.service';

@Component({
    selector: 'app-job-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Job Postings</div>
      @for (job of jobs; track job.id) {
        <div 
          (click)="onSelect(job)"
          class="group relative p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md"
          [class]="selectedJob?.id === job.id 
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'">
          
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg" [class.text-white]="selectedJob?.id === job.id">{{ job.title }}</h3>
            <span class="text-xs px-2 py-1 rounded-full font-medium"
              [class]="selectedJob?.id === job.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
              {{ job.type }}
            </span>
          </div>
          
          <p class="text-sm mb-4 line-clamp-2" [class]="selectedJob?.id === job.id ? 'text-blue-100' : 'text-slate-500'">
            {{ job.description }}
          </p>

          <div class="flex flex-wrap gap-2">
            @for (skill of job.primarySkills; track skill) {
              <span class="text-xs px-2 py-0.5 rounded border"
                [class]="selectedJob?.id === job.id ? 'border-white/30 text-white' : 'border-slate-200 text-slate-500 bg-slate-50'">
                {{ skill }}
              </span>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class JobListComponent {
    @Input({ required: true }) jobs: Job[] = [];
    @Input() selectedJob: Job | null = null;
    @Output() selectJob = new EventEmitter<Job>();

    onSelect(job: Job) {
        this.selectJob.emit(job);
    }
}
