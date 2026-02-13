import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginHeroComponent } from './login-hero.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoginHeroComponent],
  template: `
    <div class="min-h-screen bg-white flex flex-col md:flex-row relative">
      
      <!-- Validation Modal -->
      <div *ngIf="showValidationModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all" (click)="closeValidationModal()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100" (click)="$event.stopPropagation()">
          <div class="p-6 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Required Fields Missing</h3>
            <p class="text-sm text-slate-600 mb-6">
              Please fill in both <strong>Email</strong> and <strong>Password</strong> fields to continue.
            </p>
            <button (click)="closeValidationModal()" 
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Okay, I understand
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side (Hero) - Shows on top on mobile -->
      <div class="w-full md:w-1/2 min-h-[450px] md:h-auto order-1 md:order-2 bg-slate-900 relative">
        <app-login-hero></app-login-hero>
      </div>

      <!-- Left Side (Form) -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 order-2 md:order-1">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center md:text-left">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TalentMatch AI
            </h1>
            <h2 class="mt-6 text-2xl font-bold text-slate-900">Welcome back</h2>
            <p class="mt-2 text-sm text-slate-600">
              Please enter your details to access your dashboard.
            </p>
          </div>

          <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <div *ngIf="errorMessage()" class="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {{ errorMessage() }}
            </div>

            <div class="space-y-4">
              <div>
                <label for="email-address" class="block text-sm font-medium text-slate-700">Email address</label>
                <div class="mt-1">
                  <input id="email-address" formControlName="email" type="email" required 
                    class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                    placeholder="you@example.com">
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <div class="mt-1 relative">
                  <input id="password" formControlName="password" [type]="showPassword() ? 'text' : 'password'" required 
                    class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10" 
                    placeholder="••••••••">
                  <button type="button" (click)="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-3 flex items-center z-20 text-slate-400 hover:text-slate-600 focus:outline-none">
                    <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm">
                <a routerLink="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">Forgot your password?</a>
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="isLoading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading() ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>
            
            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-slate-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-slate-500">Or register as</span>
                    </div>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-3">
                    <a routerLink="/register/candidate" class="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                        Candidate
                    </a>
                    <a routerLink="/register/employer" class="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                        Employer
                    </a>
                    <a routerLink="/register/institution" class="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                        Institution
                    </a>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showValidationModal = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  closeValidationModal() {
    this.showValidationModal.set(false);
  }

  onSubmit() {
    // Check validation first
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showValidationModal.set(true);
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          // Redirect based on role
          if (res.user.role === 'super_admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (res.user.role === 'institution_admin' || res.user.role === 'institution_user') {
            this.router.navigate(['/institution/dashboard']);
          } else if (res.user.role === 'employer') {
            this.router.navigate(['/employer/dashboard']);
          } else if (res.user.role === 'candidate') {
            this.router.navigate(['/candidate/dashboard']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 403) {
            this.errorMessage.set('Your account is pending Super Admin approval. Please check back later.');
          } else {
            this.errorMessage.set(err.error?.error || 'Login failed. Please check your credentials.');
          }
        }
      });
    }
  }
}
