import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-md w-full relative z-10">
        <!-- Loading State -->
        <div *ngIf="isVerifying()" class="text-center">
          <div class="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-white/70">Verifying invite...</p>
        </div>

        <!-- Invalid Invite -->
        <div *ngIf="!isVerifying() && !isValidInvite()" class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20">
          <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Invalid or Expired Invite</h2>
          <p class="text-white/60 mb-6">This invitation link is no longer valid. Please contact the administrator for a new invite.</p>
          <a routerLink="/login" class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
            Go to Login
          </a>
        </div>

        <!-- Valid Invite Form -->
        <div *ngIf="!isVerifying() && isValidInvite()" class="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">Complete Registration</h1>
            <p class="text-white/80 mt-1 capitalize">Role: {{ formatInviteType() }}</p>
          </div>

          <div class="p-6">
            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {{ errorMessage() }}
            </div>

            <!-- Invite Info -->
            <div class="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div class="flex justify-between items-center mb-1">
                <span class="text-white/60 text-sm">Email Address</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  {{ formatInviteType() }}
                </span>
              </div>
              <p class="text-white font-medium">{{ inviteEmail() }}</p>
              <p *ngIf="institutionName()" class="text-white/60 text-sm mt-1">
                 Invited to: <span class="text-white">{{ institutionName() }}</span>
              </p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-white/70 mb-1">First Name</label>
                  <input formControlName="firstName" type="text" 
                         class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                         placeholder="John">
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/70 mb-1">Last Name</label>
                  <input formControlName="lastName" type="text" 
                         class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                         placeholder="Doe">
                </div>
              </div>

              <!-- Dynamic Fields -->
              <div *ngIf="inviteType() === 'institution'">
                <label class="block text-sm font-medium text-white/70 mb-1">Institution Name</label>
                <input formControlName="institutionName" type="text" 
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="University or Organization Name">
              </div>

              <div *ngIf="inviteType() === 'employer' && !institutionName()">
                <label class="block text-sm font-medium text-white/70 mb-1">Company Name</label>
                <input formControlName="companyName" type="text" 
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="Your Company Name">
              </div>

              <div *ngIf="inviteType() === 'candidate'">
                <label class="block text-sm font-medium text-white/70 mb-1">Top Skills (Comma separated)</label>
                <input formControlName="skills" type="text" 
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="e.g. Java, Python, React">
              </div>

              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Password</label>
                <input formControlName="password" type="password" 
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="At least 8 characters">
              </div>

              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Confirm Password</label>
                <input formControlName="confirmPassword" type="password" 
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder="Repeat your password">
              </div>

              <button type="submit" [disabled]="isSubmitting() || registerForm.invalid"
                      class="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <span *ngIf="isSubmitting()" class="animate-spin">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isSubmitting() ? 'Creating...' : 'Complete Registration' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AcceptInviteComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isVerifying = signal(true);
  isValidInvite = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  inviteEmail = signal('');
  inviteType = signal<string>('');
  institutionName = signal<string>('');
  token = '';

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    institutionName: [''], // Optional, for institution type
    companyName: [''],     // Optional, for employer type
    skills: ['']           // Optional, for candidate type
  });

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    this.verifyInvite();
  }

  async verifyInvite() {
    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/admin/verify-invite/${this.token}`).toPromise();
      if (response?.valid) {
        this.isValidInvite.set(true);
        this.inviteEmail.set(response.email);
        this.inviteType.set(response.inviteType);

        if (response.institutionName) {
          this.institutionName.set(response.institutionName);
        }

        // Add conditional validators based on invite type
        if (response.inviteType === 'institution') {
          this.registerForm.get('institutionName')?.setValidators(Validators.required);
        } else if (response.inviteType === 'employer' && !response.institutionName) {
          this.registerForm.get('companyName')?.setValidators(Validators.required);
        }
        this.registerForm.updateValueAndValidity();
      }
    } catch (error) {
      this.isValidInvite.set(false);
    } finally {
      this.isVerifying.set(false);
    }
  }

  formatInviteType(): string {
    return this.inviteType().replace('_', ' ');
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = {
      token: this.token,
      ...this.registerForm.value
    };

    try {
      await this.http.post(`${environment.apiUrl}/admin/accept-invite`, payload).toPromise();

      this.router.navigate(['/login'], { queryParams: { registered: this.inviteType() } });
    } catch (error: any) {
      this.errorMessage.set(error.error?.error || 'Failed to create account');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
