import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Skill {
  _id?: string;
  name: string;
  category?: string;
  subcategory?: string;
  skillType: 'primary' | 'secondary' | 'soft';
  isActive: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-skills-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Skills</h1>
        <a routerLink="/admin/settings/skills/create" 
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Skill
        </a>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created On</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let skill of paginatedSkills(); let i = index" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-800">
                {{ skill.name }}
                <div class="text-xs text-slate-400 font-normal" *ngIf="skill.subcategory">{{ skill.subcategory }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ skill.category || '-' }}</td>
              <td class="px-6 py-4">
                <span [class.bg-blue-100]="skill.skillType === 'primary'" 
                      [class.text-blue-800]="skill.skillType === 'primary'"
                      [class.bg-indigo-100]="skill.skillType === 'secondary'"
                      [class.text-indigo-800]="skill.skillType === 'secondary'"
                      [class.bg-purple-100]="skill.skillType === 'soft'"
                      [class.text-purple-800]="skill.skillType === 'soft'"
                      class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ (skill.skillType | titlecase) || 'Primary' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span [class]="skill.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ skill.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ skill.createdAt | date:'short' }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button (click)="editSkill(skill)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  <button (click)="toggleStatus(skill)" 
                          [class]="skill.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'"
                          class="text-sm font-medium">
                    {{ skill.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="skills().length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">No skills found</td>
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
              {{ (currentPage() - 1) * itemsPerPage() + 1 }} - {{ Math.min(currentPage() * itemsPerPage(), skills().length) }} of {{ skills().length }}
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
export class SkillsListComponent implements OnInit {
  private http = inject(HttpClient);

  skills = signal<Skill[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  itemsPerPageValue = 10;
  Math = Math;

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.http.get<Skill[]>(`${environment.apiUrl}/skills?includeInactive=true`).subscribe({
      next: (data) => this.skills.set(data),
      error: (err) => console.error('Failed to load skills', err)
    });
  }

  paginatedSkills() {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.skills().slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.skills().length / this.itemsPerPage());
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

  private router = inject(Router);

  editSkill(skill: Skill) {
    this.router.navigate(['/admin/settings/skills/edit', skill._id]);
  }

  toggleStatus(skill: Skill) {
    const newStatus = !skill.isActive;
    this.http.put(`${environment.apiUrl}/skills/${skill._id}`, { isActive: newStatus }).subscribe({
      next: () => {
        skill.isActive = newStatus;
        this.skills.set([...this.skills()]);
      },
      error: () => alert('Failed to update status')
    });
  }
}
