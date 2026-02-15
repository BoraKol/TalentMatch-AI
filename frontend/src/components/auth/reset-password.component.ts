
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginHeroComponent } from './login-hero.component';

@Component({
  selector: 'app-reset-password',
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
            <h2 class="mt-6 text-2xl font-bold text-slate-900">Reset Password</h2>
            <p class="mt-2 text-sm text-slate-600">
              Enter the verification code sent to your email and your new password.
            </p>
          </div>

          <form class="mt-8 space-y-6" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            
            <div *ngIf="message()" class="p-4 mb-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
              {{ message() }}
            </div>
            <div *ngIf="errorMessage()" class="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {{ errorMessage() }}
            </div>

            <!-- Email (Read only/Hidden or pre-filled) -->
             <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email address</label>
                <div class="mt-1">
                  <input id="email" formControlName="email" type="email" readonly
                    class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 shadow-sm focus:outline-none sm:text-sm">
                </div>
              </div>

            <!-- Verification Code -->
            <div>
              <label for="code" class="block text-sm font-medium text-slate-700">Verification Code</label>
              <div class="mt-1">
                <input id="code" formControlName="code" type="text" required 
                  class="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="123456">
              </div>
            </div>

            <!-- New Password -->
            <div>
                <label for="newPassword" class="block text-sm font-medium text-slate-700">New Password</label>
                <div class="mt-1 relative">
                  <input id="newPassword" formControlName="newPassword" [type]="showPassword() ? 'text' : 'password'" required 
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

            <div class="flex flex-col space-y-4">
              <button type="submit" [disabled]="isLoading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading() ? 'Reset Password' : 'Reset Password' }}
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = signal(false);
  message = signal('');
  errorMessage = signal('');
  showPassword = signal(false);

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resetForm.patchValue({ email: params['email'] });
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading.set(true);
      this.message.set('');
      this.errorMessage.set('');

      this.authService.resetPassword(this.resetForm.getRawValue()).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.message.set('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to reset password. Please check your code.');
        }
      });
    }
  }
}
