import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionService, Institution } from '../services/institution.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-institutions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-slate-800">Institution Management</h2>
          <p class="text-slate-500 mt-1">Manage universities and companies registered on the platform.</p>
        </div>
        <button (click)="showModal.set(true)" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add New Institution
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Total Institutions</div>
          <div class="text-3xl font-black text-slate-800">{{ institutions().length }}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <!-- Placeholder for active count -->
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Active Status</div>
          <div class="text-3xl font-black text-emerald-600">
            {{ getActiveCount() }}
          </div>
        </div>
         <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Pending Invites</div>
          <div class="text-3xl font-black text-amber-500">
             {{ getPendingCount() }}
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-sm text-left text-slate-500">
          <thead class="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4">Institution Name</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Domain</th>
              <th class="px-6 py-4">Admin Email</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inst of institutions()" class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              <td class="px-6 py-4 font-bold text-slate-900">{{ inst.name }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-purple-100 text-purple-800': inst.type === 'University',
                        'bg-blue-100 text-blue-800': inst.type === 'Corporate',
                        'bg-gray-100 text-gray-800': inst.type === 'Agency'
                      }">
                  {{ inst.type }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-xs">{{ inst.emailDomain }}</td>
               <td class="px-6 py-4">{{ inst.adminEmail }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800': inst.status === 'active',
                        'bg-amber-100 text-amber-800': inst.status === 'pending'
                      }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="inst.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ inst.status | titlecase }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                    <button (click)="inviteAdmin(inst)" *ngIf="inst.status === 'pending'" class="text-blue-600 hover:text-blue-800 font-semibold text-xs uppercase tracking-wide">
                        Resend Invite
                    </button>
                    <button (click)="updateStatus(inst, 'active')" *ngIf="inst.status === 'suspended' || inst.status === 'pending'" class="text-emerald-600 hover:text-emerald-800 font-semibold text-xs uppercase tracking-wide">
                        Activate
                    </button>
                    <button (click)="updateStatus(inst, 'suspended')" *ngIf="inst.status === 'active'" class="text-red-500 hover:text-red-700 font-semibold text-xs uppercase tracking-wide">
                        Suspend
                    </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="institutions().length === 0">
                 <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    No institutions found. Click "Add New Institution" to get started.
                 </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div class="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" (click)="showModal.set(false)"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-slate-900 mb-4" id="modal-title">
              Add New Institution
            </h3>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                  <input formControlName="name" type="text" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select formControlName="type" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                      <option value="University">University</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Agency">Agency</option>
                  </select>
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Domain (e.g. mit.edu)</label>
                  <input formControlName="emailDomain" type="text" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                  <input formControlName="adminEmail" type="email" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                  <p class="text-xs text-slate-500 mt-1">An invitation will be sent to this email to set up the admin account.</p>
                </div>
              </div>
              
              <div class="mt-8 sm:flex sm:flex-row-reverse">
                <button type="submit" [disabled]="form.invalid || isSubmitting()" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                  {{ isSubmitting() ? 'Creating...' : 'Create & Invite' }}
                </button>
                <button type="button" (click)="showModal.set(false)" class="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InstitutionsComponent implements OnInit {
  instService = inject(InstitutionService);
  fb = inject(FormBuilder);
  toast = inject(ToastService);

  institutions = this.instService.institutions;
  showModal = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['University', Validators.required],
    emailDomain: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    this.instService.getAll().subscribe();
  }

  getActiveCount() {
    return this.institutions().filter(i => i.status === 'active').length;
  }

  getPendingCount() {
    return this.institutions().filter(i => i.status === 'pending').length;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const val = this.form.value as Institution;
      // Default to pending
      val.status = 'pending';

      this.instService.create(val).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.form.reset({ type: 'University' });
          this.toast.show('Institution created and invite sent!', 'success');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.show('Failed to create institution.', 'error');
        }
      });
    }
  }

  inviteAdmin(inst: Institution) {
    if (inst._id) {
      this.instService.inviteAdmin(inst._id).subscribe({
        next: () => this.toast.show('Invitation resent.', 'success'),
        error: () => this.toast.show('Failed to resend invite.', 'error')
      });
    }
  }

  updateStatus(inst: Institution, status: 'active' | 'suspended' | 'pending') {
    if (inst._id) {
      if (confirm(`Are you sure you want to change status to ${status}?`)) {
        this.instService.updateStatus(inst._id, status).subscribe({
          next: () => this.toast.show(`Institution ${status}!`, 'success'),
          error: () => this.toast.show('Failed to update status.', 'error')
        });
      }
    }
  }
}
