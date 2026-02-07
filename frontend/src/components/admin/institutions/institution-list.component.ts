import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

interface Institution {
  _id?: string;
  name: string;
  emailDomain: string;
  adminEmail: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt?: string;
}

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmationModalComponent],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Institutions</h1>
        <a routerLink="/admin/institutions/create" 
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Institution
        </a>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Domain</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Admin Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let inst of paginatedInstitutions(); let i = index" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-800">{{ inst.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ inst.emailDomain }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ inst.adminEmail }}</td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(inst.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ inst.status | titlecase }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <a [routerLink]="['/admin/institutions/edit', inst._id]" 
                     class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</a>
                  <button (click)="deleteInstitution(inst)" 
                          class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="institutions().length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">No institutions found</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-600">Items per page:</span>
            <select [(ngModel)]="itemsPerPageValue" (ngModelChange)="onItemsPerPageChange($event)"
                    class="border border-slate-200 rounded px-2 py-1 text-sm">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="25">25</option>
            </select>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">
              {{ (currentPage() - 1) * itemsPerPage() + 1 }} - {{ Math.min(currentPage() * itemsPerPage(), institutions().length) }} of {{ institutions().length }}
            </span>
            <div class="flex gap-1">
              <button (click)="prevPage()" [disabled]="currentPage() === 1"
                      class="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
                Prev
              </button>
              <button (click)="nextPage()" [disabled]="currentPage() >= totalPages()"
                      class="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <app-confirmation-modal #confirmModal></app-confirmation-modal>
    </div>
  `
})
export class InstitutionListComponent implements OnInit {
  private http = inject(HttpClient);

  @ViewChild('confirmModal') confirmModal!: ConfirmationModalComponent;

  institutions = signal<Institution[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  itemsPerPageValue = 10;
  Math = Math;

  ngOnInit() {
    this.loadInstitutions();
  }

  loadInstitutions() {
    this.http.get<Institution[]>(`${environment.apiUrl}/institutions`).subscribe({
      next: (data) => this.institutions.set(data),
      error: (err) => console.error('Failed to load institutions', err)
    });
  }

  paginatedInstitutions() {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.institutions().slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.institutions().length / this.itemsPerPage());
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  onItemsPerPageChange(value: number) {
    this.itemsPerPage.set(Number(value));
    this.currentPage.set(1);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  async deleteInstitution(inst: Institution) {
    if (await this.confirmModal.open({
      title: 'Delete Institution',
      message: `Are you sure you want to delete "${inst.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })) {
      this.http.delete(`${environment.apiUrl}/institutions/${inst._id}`).subscribe({
        next: () => this.loadInstitutions(),
        error: (err) => alert('Failed to delete institution')
      });
    }
  }
}
