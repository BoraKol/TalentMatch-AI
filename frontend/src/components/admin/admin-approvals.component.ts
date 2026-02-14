import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from '../../services/toast.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal.component';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  template: `
    <div class="space-y-8">
      <app-confirmation-modal></app-confirmation-modal>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Registration Approvals</h1>
        <p class="text-slate-500 mt-1">Manage pending Employer and Institution accounts</p>
      </div>

      <!-- Institutions Section -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 class="font-bold text-slate-700 uppercase tracking-wider text-xs">Pending Institutions ({{ institutions().length }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100/50">
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Institution</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Email</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested At</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (inst of institutions(); track inst._id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">{{ inst.name }}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-600 font-medium">{{ inst.adminEmail }}</td>
                  <td class="px-6 py-4 text-slate-400 text-sm">{{ inst.createdAt | date:'medium' }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button (click)="approveInstitution(inst._id)" class="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">Approve</button>
                      <button (click)="reject('institution', inst._id)" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">Reject</button>
                    </div>
                  </td>
                </tr>
              }
              @if (institutions().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-8 text-center text-slate-400 italic text-sm">No pending institutions.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Employers Section -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 class="font-bold text-slate-700 uppercase tracking-wider text-xs">Pending Employers ({{ employers().length }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100/50">
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">School / Org</th>
                <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (emp of employers(); track emp._id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">{{ emp.firstName }} {{ emp.lastName }}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-600 font-medium">{{ emp.email }}</td>
                  <td class="px-6 py-4 text-slate-400 text-sm">{{ emp.institution?.name || 'Independent' }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button (click)="approveEmployer(emp._id)" class="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">Approve</button>
                      <button (click)="reject('user', emp._id)" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">Reject</button>
                    </div>
                  </td>
                </tr>
              }
              @if (employers().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-8 text-center text-slate-400 italic text-sm">No pending employers.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class AdminApprovalsComponent implements OnInit {
  @ViewChild(ConfirmationModalComponent) confirmationModal!: ConfirmationModalComponent;
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  institutions = signal<any[]>([]);
  employers = signal<any[]>([]);

  ngOnInit() {
    this.fetchPending();
  }

  fetchPending() {
    this.adminService.getPendingValidations().subscribe({
      next: (data) => {
        this.institutions.set(data.institutions);
        this.employers.set(data.employers);
      },
      error: (err) => this.toast.show('Failed to load pending queue', 'error')
    });
  }

  approveInstitution(id: string) {
    this.adminService.approveInstitution(id).subscribe({
      next: () => {
        this.toast.show('Institution and Admin approved', 'success');
        this.fetchPending();
      },
      error: (err) => this.toast.show('Approval failed', 'error')
    });
  }

  approveEmployer(id: string) {
    this.adminService.approveEmployer(id).subscribe({
      next: () => {
        this.toast.show('Employer approved', 'success');
        this.fetchPending();
      },
      error: (err) => this.toast.show('Approval failed', 'error')
    });
  }

  async reject(type: 'user' | 'institution', id: string) {
    const confirmed = await this.confirmationModal.open({
      title: 'Reject Request',
      message: 'Are you sure you want to reject/suspend this request?',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      this.adminService.rejectValidation(type, id).subscribe({
        next: () => {
          this.toast.show('Validation rejected', 'info');
          this.fetchPending();
        },
        error: (err) => this.toast.show('Action failed', 'error')
      });
    }
  }
}
