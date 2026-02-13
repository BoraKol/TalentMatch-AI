import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-invite-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <!-- Navbar -->
      <nav class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center gap-8">
              <a routerLink="/institution/dashboard" class="flex items-center gap-2">
<img src="/favicon.jpg" alt="TalentMatch AI" class="w-8 h-8 rounded-lg object-cover">
                <span class="text-xl font-bold text-slate-800">TalentMatch AI</span>
                <span class="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Institution</span>
              </a>
            </div>
            <div class="flex items-center gap-4">
              <a routerLink="/institution/dashboard" class="text-sm text-slate-600 hover:text-indigo-600">← Back to Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div class="flex items-center gap-3">
<img src="/favicon.jpg" alt="Invite Team" class="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white/20">
              <div>
                <h1 class="text-xl font-bold">Invite Team Member</h1>
                <p class="text-indigo-100 text-sm">{{ remainingSlots() }} of 5 slots available</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <!-- Success Message -->
            <div *ngIf="successMessage()" class="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <svg class="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-emerald-700">{{ successMessage() }}</div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-red-700">{{ errorMessage() }}</div>
            </div>

            <!-- No Slots Warning -->
            <div *ngIf="remainingSlots() === 0" class="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p class="text-sm text-amber-800 font-medium">You've reached the maximum of 5 users for your institution.</p>
              <p class="text-sm text-amber-600 mt-1">Contact support to upgrade your plan.</p>
            </div>

            <!-- Invite Form -->
            <form *ngIf="remainingSlots() > 0" [formGroup]="inviteForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input formControlName="email" type="email" 
                         class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all"
                         placeholder="colleague@institution.edu">
                  <p *ngIf="inviteForm.get('email')?.touched && inviteForm.get('email')?.hasError('email')" class="mt-1 text-xs text-red-500">
                    Please enter a valid email address.
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select formControlName="role" 
                          class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all">
                    <option value="institution_user">Institution User</option>
                    <option value="institution_admin">Institution Admin</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Personal Message (Optional)</label>
                  <textarea formControlName="message" rows="3"
                            class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 transition-all resize-none"
                            placeholder="Add a personal note to the invitation..."></textarea>
                </div>
              </div>

              <button type="submit" [disabled]="isLoading() || inviteForm.invalid"
                      class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg *ngIf="isLoading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading() ? 'Sending Invite...' : 'Send Invitation' }}
              </button>
            </form>

            <!-- Pending Invites -->
            <div *ngIf="pendingInvites().length > 0" class="mt-8 pt-6 border-t border-slate-100">
              <h3 class="text-sm font-semibold text-slate-700 mb-4">Pending Invitations</h3>
              <div class="space-y-3">
                <div *ngFor="let invite of pendingInvites()" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-sm font-medium text-slate-800">{{ invite.email }}</p>
                    <p class="text-xs text-slate-500">Sent {{ invite.createdAt | date:'short' }}</p>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InviteTeamComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  remainingSlots = signal(4);
  pendingInvites = signal<any[]>([]);

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['institution_user', Validators.required],
    message: ['']
  });

  ngOnInit() {
    this.loadInstitutionStats();
    this.loadPendingInvites();
  }

  loadInstitutionStats() {
    // Get current user's institution user count
    this.http.get<any>(`${environment.apiUrl}/admin/institution/users`).subscribe({
      next: (res) => {
        const currentUsers = res.userCount || 1;
        this.remainingSlots.set(Math.max(0, 5 - currentUsers));
      },
      error: () => {
        // Default to 4 slots if API fails
        this.remainingSlots.set(4);
      }
    });
  }

  loadPendingInvites() {
    this.http.get<any>(`${environment.apiUrl}/admin/invites?type=institution`).subscribe({
      next: (res) => {
        this.pendingInvites.set(res.invites || []);
      },
      error: () => {
        this.pendingInvites.set([]);
      }
    });
  }

  onSubmit() {
    if (this.inviteForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      email: this.inviteForm.value.email,
      inviteType: this.inviteForm.value.role === 'institution_admin' ? 'institution' : 'institution',
      role: this.inviteForm.value.role,
      message: this.inviteForm.value.message
    };

    this.http.post(`${environment.apiUrl}/admin/invite`, payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set(`Invitation sent to ${this.inviteForm.value.email}`);
        this.inviteForm.reset({ role: 'institution_user' });
        this.loadInstitutionStats();
        this.loadPendingInvites();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to send invitation. Please try again.');
      }
    });
  }
}
