import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Institution } from '../../services/institution.service';

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-slate-500 whitespace-nowrap">
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
            <tr *ngFor="let inst of institutions" class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
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
                        'bg-amber-100 text-amber-800': inst.status === 'pending',
                        'bg-red-100 text-red-800': inst.status === 'suspended'
                      }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="inst.status === 'active' ? 'bg-emerald-500' : (inst.status === 'pending' ? 'bg-amber-500' : 'bg-red-500')"></span>
                  {{ inst.status | titlecase }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                    <button (click)="onInviteAdmin(inst)" *ngIf="inst.status === 'pending'" class="text-blue-600 hover:text-blue-800 font-semibold text-xs uppercase tracking-wide">
                        Resend Invite
                    </button>
                    <button (click)="onUpdateStatus(inst, 'active')" *ngIf="inst.status === 'suspended' || inst.status === 'pending'" class="text-emerald-600 hover:text-emerald-800 font-semibold text-xs uppercase tracking-wide">
                        Activate
                    </button>
                    <button (click)="onUpdateStatus(inst, 'suspended')" *ngIf="inst.status === 'active'" class="text-red-500 hover:text-red-700 font-semibold text-xs uppercase tracking-wide">
                        Suspend
                    </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="institutions.length === 0">
                 <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    No institutions found. Click "Add New Institution" to get started.
                 </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InstitutionListComponent {
  @Input({ required: true }) institutions: Institution[] = [];
  @Output() inviteAdmin = new EventEmitter<Institution>();
  @Output() updateStatus = new EventEmitter<{ inst: Institution, status: 'active' | 'suspended' | 'pending' }>();

  onInviteAdmin(inst: Institution) {
    this.inviteAdmin.emit(inst);
  }

  onUpdateStatus(inst: Institution, status: 'active' | 'suspended' | 'pending') {
    this.updateStatus.emit({ inst, status });
  }
}
