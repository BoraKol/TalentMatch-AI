import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-job-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <a routerLink="/employer/dashboard" class="inline-flex items-center text-sm text-slate-600 hover:text-emerald-600 mb-4">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </a>
          <h1 class="text-3xl font-bold text-slate-800">Post a New Job</h1>
          <p class="text-slate-600 mt-2">Create a job listing and find the best candidates with AI</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
            <!-- Basic Info -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">1</span>
                Basic Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                  <input formControlName="title" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. Senior Frontend Developer">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                  <input formControlName="company" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-200 px-4 py-3"
                         placeholder="Your company name">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input formControlName="location" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. Istanbul, Remote">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                  <select formControlName="employmentType"
                          class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Experience Required (years)</label>
                  <input formControlName="experienceRequired" type="number" min="0"
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="0">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                  <input formControlName="salaryRange" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. 80,000 - 120,000 TL">
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">2</span>
                Job Description
              </h2>
              <textarea formControlName="description" rows="5"
                        class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                        placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."></textarea>
            </div>

            <!-- Skills -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">3</span>
                Required Skills
              </h2>
              <p class="text-sm text-slate-500 mb-4">Select the skills that are essential for this role</p>
              <div class="flex flex-wrap gap-2">
                @for (skill of availableSkills; track skill) {
                  <button type="button" 
                          (click)="toggleSkill(skill, 'required')"
                          [class]="isSkillSelected(skill, 'required') 
                            ? 'px-4 py-2 rounded-full bg-emerald-500 text-white font-medium transition-all shadow-md' 
                            : 'px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all'">
                    {{ skill }}
                  </button>
                }
              </div>
            </div>

            <!-- Preferred Skills -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                Preferred Skills (Nice to Have)
              </h2>
              <p class="text-sm text-slate-500 mb-4">Select bonus skills that would be great to have</p>
              <div class="flex flex-wrap gap-2">
                @for (skill of availableSkills; track skill) {
                  <button type="button" 
                          (click)="toggleSkill(skill, 'preferred')"
                          [class]="isSkillSelected(skill, 'preferred') 
                            ? 'px-4 py-2 rounded-full bg-blue-500 text-white font-medium transition-all shadow-md' 
                            : 'px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all'">
                    {{ skill }}
                  </button>
                }
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <!-- Submit -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button type="submit" 
                      [disabled]="isLoading() || !jobForm.valid"
                      class="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isLoading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Posting...
                  </span>
                } @else {
                  Post Job & Find Candidates with AI
                }
              </button>
              <button type="button" routerLink="/employer/dashboard"
                      class="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class JobPostComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');
  requiredSkills = signal<string[]>([]);
  preferredSkills = signal<string[]>([]);

  private getCompanyName(): string {
    const user = this.authService.currentUser();
    return user?.companyName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  }

  availableSkills = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js', 'Node.js',
    'Python', 'Java', 'C#', 'SQL', 'MongoDB', 'PostgreSQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Figma'
  ];

  jobForm = this.fb.group({
    title: ['', Validators.required],
    company: [{ value: this.getCompanyName(), disabled: true }, Validators.required],
    description: ['', Validators.required],
    location: [''],
    employmentType: ['Full-time'],
    experienceRequired: [0],
    salaryRange: ['']
  });



  toggleSkill(skill: string, type: 'required' | 'preferred') {
    if (type === 'required') {
      const current = this.requiredSkills();
      if (current.includes(skill)) {
        this.requiredSkills.set(current.filter(s => s !== skill));
      } else {
        this.requiredSkills.set([...current, skill]);
        // Remove from preferred if added to required
        this.preferredSkills.set(this.preferredSkills().filter(s => s !== skill));
      }
    } else {
      const current = this.preferredSkills();
      if (current.includes(skill)) {
        this.preferredSkills.set(current.filter(s => s !== skill));
      } else {
        this.preferredSkills.set([...current, skill]);
        // Remove from required if added to preferred
        this.requiredSkills.set(this.requiredSkills().filter(s => s !== skill));
      }
    }
  }

  isSkillSelected(skill: string, type: 'required' | 'preferred'): boolean {
    if (type === 'required') {
      return this.requiredSkills().includes(skill);
    }
    return this.preferredSkills().includes(skill);
  }

  onSubmit() {
    if (this.jobForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const jobData = {
        ...this.jobForm.getRawValue(),
        requiredSkills: this.requiredSkills(),
        preferredSkills: this.preferredSkills(),
        requirements: this.requiredSkills() // for backwards compatibility
      };

      this.http.post<any>(`${environment.apiUrl}/jobs`, jobData).subscribe({
        next: (response) => {
          // Navigate to AI match results with the new job ID
          this.router.navigate(['/employer/jobs', response._id, 'matches']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to post job');
        }
      });
    }
  }
}
