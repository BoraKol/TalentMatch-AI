import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionService, Institution } from '../services/institution.service';
import { ToastService } from '../services/toast.service';
import { InstitutionStatsComponent } from './institutions/institution-stats.component';
import { InstitutionListComponent } from './institutions/institution-list.component';
import { InstitutionCreateModalComponent } from './institutions/institution-create-modal.component';

@Component({
  selector: 'app-institutions',
  standalone: true,
  imports: [CommonModule, InstitutionStatsComponent, InstitutionListComponent, InstitutionCreateModalComponent],
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
      <app-institution-stats [institutions]="institutions"></app-institution-stats>

      <!-- List -->
      <app-institution-list 
        [institutions]="institutions()" 
        (inviteAdmin)="inviteAdmin($event)" 
        (updateStatus)="updateStatusObj($event)">
      </app-institution-list>
    </div>

    <!-- Modal -->
    <app-institution-create-modal 
        *ngIf="showModal()" 
        (close)="showModal.set(false)">
    </app-institution-create-modal>
  `
})
export class InstitutionsComponent implements OnInit {
  instService = inject(InstitutionService);
  toast = inject(ToastService);

  institutions = this.instService.institutions;
  showModal = signal(false);

  ngOnInit() {
    this.instService.getAll().subscribe();
  }

  inviteAdmin(inst: Institution) {
    if (inst._id) {
      this.instService.inviteAdmin(inst._id).subscribe({
        next: () => this.toast.show('Invitation resent.', 'success'),
        error: () => this.toast.show('Failed to resend invite.', 'error')
      });
    }
  }

  updateStatusObj(event: { inst: Institution, status: 'active' | 'suspended' | 'pending' }) {
    this.updateStatus(event.inst, event.status);
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
