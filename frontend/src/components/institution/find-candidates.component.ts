import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-find-candidates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header & Search -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Find Candidates</h1>
            <p class="text-slate-500">Search and connect with qualified talent</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
                     type="text" placeholder="Search by name, skills..." 
                     class="pl-10 pr-4 py-2.5 w-72 rounded-xl border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4 shadow-sm border border-slate-100">
          <span class="text-sm font-medium text-slate-600">Filter by:</span>
          <select [(ngModel)]="filterSkill" (ngModelChange)="onFilter()" 
                  class="rounded-lg border-slate-200 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500">
            <option value="">All Skills</option>
            <option *ngFor="let skill of availableSkills" [value]="skill">{{ skill }}</option>
          </select>
          <select [(ngModel)]="filterRegion" (ngModelChange)="onFilter()"
                  class="rounded-lg border-slate-200 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500">
            <option value="">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia">Asia</option>
            <option value="Other">Other</option>
          </select>
          <button (click)="clearFilters()" class="text-sm text-indigo-600 hover:text-indigo-800">Clear Filters</button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Candidates Grid -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let candidate of filteredCandidates()" 
               class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-6">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {{ getInitials(candidate) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-800 truncate">{{ candidate.firstName }} {{ candidate.lastName }}</h3>
                  <p class="text-sm text-slate-500">{{ candidate.school || 'No school specified' }}</p>
                  <p class="text-xs text-slate-400">{{ candidate.region || 'No region' }} • {{ candidate.country || 'No country' }}</p>
                </div>
              </div>

              <div class="mt-4">
                <p class="text-xs font-medium text-slate-500 mb-2">Skills</p>
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let skill of candidate.skills?.slice(0, 4)" 
                        class="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-md">{{ skill }}</span>
                  <span *ngIf="candidate.skills?.length > 4" class="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md">
                    +{{ candidate.skills.length - 4 }}
                  </span>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <a [routerLink]="['/institution/candidates', candidate._id]" 
                   class="text-sm font-medium text-indigo-600 hover:text-indigo-800">View Profile →</a>
                <button (click)="contactCandidate(candidate)" class="text-sm text-slate-500 hover:text-slate-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && filteredCandidates().length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="text-lg font-medium text-slate-700 mb-1">No candidates found</h3>
          <p class="text-slate-500">Try adjusting your search or filters</p>
        </div>
      </div>
    </div>
  `
})
export class FindCandidatesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoading = signal(true);
  candidates = signal<any[]>([]);
  filteredCandidates = signal<any[]>([]);

  searchQuery = '';
  filterSkill = '';
  filterRegion = '';

  availableSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular', 'Node.js',
    'AWS', 'Docker', 'SQL', 'MongoDB', 'Machine Learning', 'Data Science'
  ];

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/candidates`).subscribe({
      next: (res) => {
        const candidateList = res.candidates || res || [];
        this.candidates.set(candidateList);
        this.filteredCandidates.set(candidateList);
        this.isLoading.set(false);
      },
      error: () => {
        this.candidates.set([]);
        this.filteredCandidates.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterSkill = '';
    this.filterRegion = '';
    this.filteredCandidates.set(this.candidates());
  }

  applyFilters() {
    let results = this.candidates();

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      results = results.filter(c =>
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.skills?.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    // Skill filter
    if (this.filterSkill) {
      results = results.filter(c => c.skills?.includes(this.filterSkill));
    }

    // Region filter
    if (this.filterRegion) {
      results = results.filter(c => c.region === this.filterRegion);
    }

    this.filteredCandidates.set(results);
  }

  getInitials(candidate: any): string {
    const first = candidate.firstName?.[0] || '';
    const last = candidate.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }

  contactCandidate(candidate: any) {
    // Could open a modal or navigate to contact page
    alert(`Contact feature coming soon!\nEmail: ${candidate.email || 'Not available'}`);
  }
}
