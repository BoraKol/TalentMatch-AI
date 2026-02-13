
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginHeroComponent } from './login-hero.component';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LoginHeroComponent],
    template: `
    <div class="min-h-screen bg-white flex flex-col md:flex-row">
      <!-- Right Side (Hero) -->
      <div class="w-full md:w-1/2 min-h-[200px] md:h-auto order-1 md:order-2 bg-slate-900 relative hidden md:block">
        <app-login-hero></app-login-hero>
      </div>

      <!-- Left Side (Form) -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 order-2 md:order-1">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center md:text-left">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TalentMatch AI
            </h1>
            <h2 class="mt-6 text-2xl font-bold text-slate-900">Forgot Password?</h2>
            <p class="mt-2 text-sm text-slate-600">
              Enter your email address to receive a verification code.
            </p>
          </div>

          <form class="mt-8 space-y-6" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            
            <div *ngIf="message()" class="p-4 mb-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
              {{ message() }}
            </div>
            <div *ngIf="errorMessage()" class="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {{ errorMessage() }}
            </div>

            <div>
              <label for="email-address" class="block text-sm font-medium text-slate-700">Email address</label>
              <div class="mt-1">
                <input id="email-address" formControlName="email" type="email" required 
                  class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="you@example.com">
              </div>
            </div>

            <div class="flex flex-col space-y-4">
              <button type="submit" [disabled]="isLoading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading() ? 'Sending...' : 'Send Verification Code' }}
              </button>

              <a routerLink="/login" class="w-full flex justify-center py-3 px-4 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    forgotForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = signal(false);
    message = signal('');
    errorMessage = signal('');

    onSubmit() {
        if (this.forgotForm.valid) {
            this.isLoading.set(true);
            this.message.set('');
            this.errorMessage.set('');

            const email = this.forgotForm.get('email')?.value;

            this.authService.forgotPassword(email!).subscribe({
                next: (res) => {
                    this.isLoading.set(false);
                    this.message.set('Verification code sent! Please check your email.');
                    // Redirect to reset page after short delay or immediately
                    setTimeout(() => {
                        this.router.navigate(['/reset-password'], { queryParams: { email: email } });
                    }, 1500);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.message || 'Failed to send verification code.');
                }
            });
        }
    }
}
