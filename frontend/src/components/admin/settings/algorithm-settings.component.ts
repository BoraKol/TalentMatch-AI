import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface AlgorithmSetting {
  _id?: string;
  fieldName: string;
  fieldValue: number;
  slug: string;
  createdAt?: string;
}

@Component({
  selector: 'app-algorithm-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Algorithm Settings</h1>
        <button (click)="saveSettings()" [disabled]="isSaving()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
          {{ isSaving() ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="successMessage()" class="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
        {{ successMessage() }}
      </div>
      <div *ngIf="errorMessage()" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ errorMessage() }}
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Field Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Field Value</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Slug</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created On</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let setting of paginatedSettings(); let i = index" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-800">{{ setting.fieldName }}</td>
              <td class="px-6 py-4">
                <input type="number" [(ngModel)]="setting.fieldValue" min="0" max="100"
                       class="w-24 px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ setting.slug }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ setting.createdAt | date:'short' }}</td>
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
              {{ (currentPage() - 1) * itemsPerPage() + 1 }} - {{ Math.min(currentPage() * itemsPerPage(), settings().length) }} of {{ settings().length }}
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
export class AlgorithmSettingsComponent implements OnInit {
  private http = inject(HttpClient);

  settings = signal<AlgorithmSetting[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  itemsPerPageValue = 10;
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  Math = Math;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Load from API or use defaults
    this.http.get<any>(`${environment.apiUrl}/settings/algorithm`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const order = ['primary_skills', 'soft_skills', 'nice_to_have', 'secondary_skills'];
          this.settings.set(data.sort((a: AlgorithmSetting, b: AlgorithmSetting) => {
            return order.indexOf(a.slug) - order.indexOf(b.slug);
          }));
        } else {
          this.initializeDefaults();
        }
      },
      error: () => this.initializeDefaults()
    });
  }

  initializeDefaults() {
    const defaults: AlgorithmSetting[] = [
      { fieldName: 'Primary Skills', fieldValue: 10, slug: 'primary_skills', createdAt: new Date().toISOString() },
      { fieldName: 'Secondary Skills', fieldValue: 5, slug: 'secondary_skills', createdAt: new Date().toISOString() },
      { fieldName: 'Nice to Have', fieldValue: 2, slug: 'nice_to_have', createdAt: new Date().toISOString() },
      { fieldName: 'Soft Skills', fieldValue: 3, slug: 'soft_skills', createdAt: new Date().toISOString() }
    ];
    this.settings.set(defaults);
  }

  paginatedSettings() {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.settings().slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.settings().length / this.itemsPerPage());
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

  saveSettings() {
    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.put(`${environment.apiUrl}/settings/algorithm`, { settings: this.settings() }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Algorithm settings saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to save settings');
      }
    });
  }
}
