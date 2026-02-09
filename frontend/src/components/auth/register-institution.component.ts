import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-register-institution',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-start justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-auto">
      <!-- Background Decorations -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div class="max-w-xl w-full relative z-10">
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
            <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <h1 class="text-2xl font-extrabold tracking-tight">Institution Registration</h1>
            <p class="mt-2 text-indigo-100 font-medium">Job Referral. Faster Networking.</p>
            <p class="mt-1 text-indigo-200 text-sm">Each institution is allowed up to 5 user accounts.</p>
          </div>

          <div class="p-8">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Errors -->
              <div *ngIf="errorMessage()" class="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="text-sm text-red-700 font-medium">{{ errorMessage() }}</div>
              </div>

              <!-- Section: Admin Info -->
              <div>
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span class="w-8 h-px bg-slate-300"></span> Admin Information <span class="w-full h-px bg-slate-100"></span>
                </h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-slate-700">First Name</label>
                        <input formControlName="firstName" type="text" 
                               class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                               placeholder="John">
                      </div>
                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-slate-700">Last Name</label>
                        <input formControlName="lastName" type="text" 
                               class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                               placeholder="Doe">
                      </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Admin Email</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input formControlName="email" type="email" 
                             class="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                             placeholder="admin@university.edu">
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Password</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" 
                             class="w-full pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                             placeholder="At least 6 characters">
                      <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                        <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                    <p *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')" class="mt-1 text-xs text-red-500">
                      Password must be at least 6 characters long.
                    </p>
                  </div>
               </div>
              </div>

              <!-- Section: Institution Details -->
              <div>
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span class="w-8 h-px bg-slate-300"></span> Institution Details <span class="w-full h-px bg-slate-100"></span>
                </h3>
               <div class="space-y-4">
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Institution Name</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      </div>
                      <input formControlName="institutionName" type="text" 
                             class="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                             placeholder="Stanford University">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="block text-sm font-medium text-slate-700">Institution Type</label>
                      <div class="relative">
                        <select formControlName="institutionType" 
                                class="appearance-none w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200">
                            <option value="university">University</option>
                            <option value="organization">Organization</option>
                            <option value="company">Company</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <label class="block text-sm font-medium text-slate-700">Email Domain</label>
                      <input formControlName="emailDomain" type="text" 
                             class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                             placeholder="stanford.edu">
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Website <span class="text-slate-400 font-normal">(Optional)</span></label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <input formControlName="website" type="url" 
                             class="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all duration-200"
                             placeholder="https://www.stanford.edu">
                    </div>
                  </div>
               </div>
              </div>

              <div class="pt-2">
                <button type="submit" [disabled]="isLoading() || registerForm.invalid"
                  class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5">
                  <span *ngIf="isLoading()" class="mr-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ isLoading() ? 'Creating Institution...' : 'Register Institution' }}
                </button>
              </div>
              
              <div class="text-center">
                  <p class="text-sm text-slate-600">
                    Already have an account? 
                    <a routerLink="/login" class="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Sign in here</a>
                  </p>
              </div>

              <div class="text-center pt-2">
                  <p class="text-sm text-slate-500">
                    Looking for a job? 
                    <a routerLink="/register/candidate" class="font-semibold text-blue-600 hover:text-blue-500 transition-colors">Register as Candidate</a>
                    <span class="mx-2 text-slate-300">|</span>
                    <a routerLink="/register/employer" class="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">Register as Employer</a>
                  </p>
              </div>

            </form>
          </div>
        </div>
        
        <div class="text-center mt-8 text-sm text-slate-400">
            &copy; 2026 TalentMatch AI. All rights reserved.
        </div>
      </div>
    </div>
  `
})
export class RegisterInstitutionComponent {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);

    isLoading = signal(false);
    errorMessage = signal('');
    showPassword = signal(false);

    registerForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        institutionName: ['', Validators.required],
        institutionType: ['university', Validators.required],
        emailDomain: ['', Validators.required],
        website: ['']
    });

    togglePassword() {
        this.showPassword.update(v => !v);
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');

            const url = `${environment.apiUrl}/auth/register/institution`;

            this.http.post(url, this.registerForm.value).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.router.navigate(['/login'], { queryParams: { registered: 'institution' } });
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.error || 'Registration failed. Please try again.');
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
