import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register-candidate',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-slate-900">Create Candidate Profile</h1>
          <p class="mt-2 text-sm text-slate-600">
            Join TalentMatch AI to find your dream job with AI-powered matching.
          </p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          
          <!-- Errors -->
          <div *ngIf="errorMessage()" class="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {{ errorMessage() }}
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">First Name</label>
              <input formControlName="firstName" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Last Name</label>
              <input formControlName="lastName" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Email Address</label>
            <input formControlName="email" type="email" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Password</label>
            <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
          </div>

          <!-- Location & Education -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label class="block text-sm font-medium text-slate-700">Country</label>
              <input formControlName="country" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Region</label>
              <input formControlName="region" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">School / University</label>
              <input formControlName="school" type="text" placeholder="e.g. MIT" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Department</label>
              <input formControlName="department" type="text" placeholder="e.g. Computer Science" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
          </div>

          <!-- Skills Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-900 mb-2">Select Your Skills</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
              <div *ngFor="let skill of availableSkills" class="flex items-center">
                <input type="checkbox" [id]="skill" [value]="skill" (change)="onSkillChange($event)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <label [for]="skill" class="ml-2 text-sm text-gray-700">{{ skill }}</label>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">* Select all programming languages and tools you are proficient in.</p>
          </div>

          <button type="submit" [disabled]="isLoading() || registerForm.invalid"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading() ? 'Creating Profile...' : 'Register' }}
          </button>
          
          <div class="text-center mt-4">
              <a routerLink="/login" class="text-sm text-blue-600 hover:text-blue-500">Already have an account? Login</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class RegisterCandidateComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    // In a real app, fetch this from Backend Settings API
    availableSkills = [
        'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js',
        'Node.js', 'Python', 'Java', 'C#', 'SQL',
        'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
        'Figma', 'Git', 'CI/CD'
    ];

    registerForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        country: ['', Validators.required],
        region: ['', Validators.required],
        school: ['', Validators.required],
        department: ['', Validators.required],
        skills: [[] as string[]]
    });

    isLoading = signal(false);
    errorMessage = signal('');

    onSkillChange(event: any) {
        const skill = event.target.value;
        const currentSkills = this.registerForm.get('skills')?.value as string[];

        if (event.target.checked) {
            this.registerForm.patchValue({ skills: [...currentSkills, skill] });
        } else {
            this.registerForm.patchValue({ skills: currentSkills.filter(s => s !== skill) });
        }
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');

            this.authService.registerCandidate(this.registerForm.value).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    // Auto login or redirect to login
                    this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.error || 'Registration failed.');
                }
            });
        }
    }
}
