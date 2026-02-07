import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal.component';

interface Testimonial {
  _id?: string;
  title?: string;
  authorName: string;
  role: string;
  content: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmationModalComponent],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Testimonials</h1>
        <a routerLink="/admin/testimonials/create" 
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Testimonial
        </a>
      </div>

      <!-- Filter -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="filterText" (ngModelChange)="applyFilter()"
               placeholder="Search by name or title..."
               class="px-4 py-2 border border-slate-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Image</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let test of paginatedTestimonials(); let i = index" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-800">{{ test.authorName }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ test.title || test.role }}</td>
              <td class="px-6 py-4">
                <img *ngIf="test.avatarUrl" [src]="test.avatarUrl" class="w-10 h-10 rounded-full object-cover">
                <span *ngIf="!test.avatarUrl" class="text-slate-400 text-sm">No image</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <a [routerLink]="['/admin/testimonials/edit', test._id]" 
                     class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</a>
                  <button (click)="deleteTestimonial(test)" 
                          class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTestimonials().length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">No testimonials found</td>
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
              {{ (currentPage() - 1) * itemsPerPage() + 1 }} - {{ Math.min(currentPage() * itemsPerPage(), filteredTestimonials().length) }} of {{ filteredTestimonials().length }}
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
export class TestimonialListComponent implements OnInit {
  private http = inject(HttpClient);

  // Get reference to modal
  @ViewChild('confirmModal') confirmModal!: ConfirmationModalComponent;

  testimonials = signal<Testimonial[]>([]);
  filteredTestimonials = signal<Testimonial[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  itemsPerPageValue = 10;
  filterText = '';
  Math = Math;

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.http.get<Testimonial[]>(`${environment.apiUrl}/testimonials`).subscribe({
      next: (data) => {
        this.testimonials.set(data);
        this.filteredTestimonials.set(data);
      },
      error: (err) => console.error('Failed to load testimonials', err)
    });
  }

  applyFilter() {
    const filter = this.filterText.toLowerCase();
    this.filteredTestimonials.set(
      this.testimonials().filter(t =>
        t.authorName.toLowerCase().includes(filter) ||
        (t.title?.toLowerCase().includes(filter)) ||
        t.role.toLowerCase().includes(filter)
      )
    );
    this.currentPage.set(1);
  }

  paginatedTestimonials() {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredTestimonials().slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.filteredTestimonials().length / this.itemsPerPage());
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

  async deleteTestimonial(test: Testimonial) {
    if (await this.confirmModal.open({
      title: 'Delete Testimonial',
      message: `Are you sure you want to delete this testimonial by "${test.authorName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })) {
      this.http.delete(`${environment.apiUrl}/testimonials/${test._id}`).subscribe({
        next: () => this.loadTestimonials(),
        error: (err) => alert('Failed to delete testimonial')
      });
    }
  }
}
