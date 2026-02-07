import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface EmploymentType {
  _id?: string;
  name: string;
  level?: string;
  isActive: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-employment-types-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Employment Types</h1>
        <a routerLink="/admin/settings/employment-types/create" 
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Employment Type
        </a>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Level</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created On</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let type of paginatedTypes(); let i = index" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-800">{{ type.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ type.level || '-' }}</td>
              <td class="px-6 py-4">
                <span [class]="type.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ type.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ type.createdAt | date:'short' }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button (click)="editType(type)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  <button (click)="toggleStatus(type)" 
                          [class]="type.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'"
                          class="text-sm font-medium">
                    {{ type.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="types().length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">No employment types found</td>
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
              {{ (currentPage() - 1) * itemsPerPage() + 1 }} - {{ Math.min(currentPage() * itemsPerPage(), types().length) }} of {{ types().length }}
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
    </div>
  `
})
export class EmploymentTypesListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Is this needed? Maybe not, but router is.

  types = signal<EmploymentType[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  itemsPerPageValue = 10;
  Math = Math;

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.http.get<EmploymentType[]>(`${environment.apiUrl}/employment-types`).subscribe({
      next: (data) => this.types.set(data),
      error: (err) => console.error('Failed to load employment types', err)
    });
  }

  paginatedTypes() {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.types().slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.types().length / this.itemsPerPage());
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

  editType(type: EmploymentType) {
    this.router.navigate(['/admin/settings/employment-types/edit', type._id]);
  }

  toggleStatus(type: EmploymentType) {
    const newStatus = !type.isActive;
    this.http.patch(`${environment.apiUrl}/employment-types/${type._id}`, { isActive: newStatus }).subscribe({
      next: () => {
        type.isActive = newStatus;
        this.types.set([...this.types()]);
      },
      error: () => alert('Failed to update status')
    });
  }
}
