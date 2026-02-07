import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface DashboardData {
  summary: {
    totalCandidates: number;
    totalJobs: number;
    totalUsers: number;
  };
  skills: { name: string; count: number }[];
  experience: { range: string; count: number }[];
  hiresByInstitution: { name: string; count: number }[];
  topEmployers: { name: string; count: number }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
          <p class="text-slate-500 mt-1">Real-time insights into your talent pool</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="loadDashboardData()" class="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p class="mt-4 text-slate-500">Loading analytics data...</p>
        </div>
      </div>

      <div *ngIf="!isLoading()">
        <!-- Stats Cards with Gradient -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-blue-100 text-sm font-medium uppercase mb-1">Total Users</div>
                <div class="text-4xl font-black">{{ stats().totalUsers | number }}</div>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center text-blue-100 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Platform users
            </div>
          </div>

          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-emerald-100 text-sm font-medium uppercase mb-1">Total Jobs</div>
                <div class="text-4xl font-black">{{ stats().totalJobs | number }}</div>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center text-emerald-100 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active positions
            </div>
          </div>

          <div class="bg-gradient-to-br from-violet-500 to-violet-600 p-6 rounded-2xl shadow-lg shadow-violet-500/20 text-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-violet-100 text-sm font-medium uppercase mb-1">Candidates</div>
                <div class="text-4xl font-black">{{ stats().totalCandidates | number }}</div>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center text-violet-100 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Active profiles
            </div>
          </div>

          <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-amber-100 text-sm font-medium uppercase mb-1">Top Skills</div>
                <div class="text-4xl font-black">{{ topSkills().length }}</div>
              </div>
              <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center text-amber-100 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tracked skills
            </div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Donut Chart: Skills Distribution -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Skills Distribution</h3>
            <div class="flex items-center justify-center">
              <div class="relative w-48 h-48">
                <!-- SVG Donut Chart -->
                <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                  <circle *ngFor="let skill of getDonutSegments(); let i = index"
                          cx="50" cy="50" r="40" fill="none" 
                          [attr.stroke]="skill.color"
                          stroke-width="12"
                          [attr.stroke-dasharray]="skill.dashArray"
                          [attr.stroke-dashoffset]="skill.dashOffset"
                          class="transition-all duration-700"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-3xl font-black text-slate-800">{{ getTotalSkillCount() }}</div>
                    <div class="text-xs text-slate-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-2">
              <div *ngFor="let skill of topSkills().slice(0, 6); let i = index" class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" [style.background]="getSkillColorHex(i)"></span>
                <span class="text-xs text-slate-600 truncate">{{ skill.name }}</span>
              </div>
            </div>
          </div>

          <!-- Top Skills Horizontal Bars -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Top Skills in Demand</h3>
            <div class="space-y-4">
              <div *ngFor="let skill of topSkills().slice(0, 8); let i = index" class="flex items-center gap-4">
                <div class="w-24 text-sm font-medium text-slate-700 truncate">{{ skill.name }}</div>
                <div class="flex-1 relative">
                  <div class="w-full bg-slate-100 rounded-full h-8 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                         [style.width.%]="getSkillPercentage(skill.count)"
                         [style.background]="getSkillGradient(i)">
                      <span class="text-xs font-bold text-white">{{ skill.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="topSkills().length === 0" class="text-center text-slate-400 py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No skill data available yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Experience Distribution - Area Style -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Experience Distribution</h3>
            <div class="h-56 flex items-end justify-around gap-3 px-2">
              <div *ngFor="let exp of experience(); let i = index" 
                   class="flex-1 flex flex-col items-center group cursor-pointer">
                <div class="relative w-full">
                  <div class="w-full rounded-t-xl transition-all duration-500 group-hover:opacity-80"
                       [style.height.px]="getExpHeight(exp.count)"
                       [style.background]="'linear-gradient(to top, ' + getExpColor(i) + ', ' + getExpColorLight(i) + ')'">
                  </div>
                  <!-- Tooltip -->
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {{ exp.count }} candidates
                  </div>
                </div>
                <span class="text-xs text-slate-500 mt-2 text-center">{{ exp.range }}</span>
              </div>
              <div *ngIf="experience().length === 0" class="flex-1 flex items-center justify-center text-slate-400">
                No experience data
              </div>
            </div>
          </div>

          <!-- Top Employers - Cards -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Top Hiring Companies</h3>
            <div class="space-y-3">
              <div *ngFor="let employer of topEmployers().slice(0, 5); let i = index" 
                   class="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md"
                   [class]="i === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100' : 'bg-slate-50 hover:bg-slate-100'">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                     [class]="i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 
                              i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : 
                              i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' : 'bg-slate-200 text-slate-600'">
                  {{ i + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-800">{{ employer.name || 'Unknown Company' }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                           [style.width.%]="getEmployerPercentage(employer.count)"></div>
                    </div>
                    <span class="text-sm font-medium text-slate-600">{{ employer.count }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="topEmployers().length === 0" class="text-center text-slate-400 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>No employer data available yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hires by Institution - Full Width -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="text-lg font-bold text-slate-800 mb-6">Hired Candidates by Source</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let inst of hiresByInstitution().slice(0, 6); let i = index" 
                 class="relative p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all duration-300 group overflow-hidden">
              <!-- Background progress -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 transition-all duration-500"
                   [style.width.%]="getInstPercentage(inst.count)"></div>
              <div class="relative flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">{{ inst.name || 'Unknown' }}</p>
                  <p class="text-sm text-slate-500">{{ inst.count }} hired</p>
                </div>
                <div class="text-2xl font-black text-emerald-600">{{ getInstPercentage(inst.count) }}%</div>
              </div>
            </div>
            <div *ngIf="hiresByInstitution().length === 0" class="col-span-full text-center text-slate-400 py-12">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No hiring data available yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  isLoading = signal(true);

  stats = signal({
    totalUsers: 0,
    totalJobs: 0,
    totalCandidates: 0
  });

  topSkills = signal<{ name: string, count: number }[]>([]);
  topEmployers = signal<{ name: string, count: number }[]>([]);
  hiresByInstitution = signal<{ name: string, count: number }[]>([]);
  experience = signal<{ range: string, count: number }[]>([]);

  private maxSkillCount = 1;
  private maxExpCount = 1;
  private maxInstCount = 1;
  private maxEmployerCount = 1;

  private skillColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#14b8a6'];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.http.get<DashboardData>(`${environment.apiUrl}/analytics/dashboard`).subscribe({
      next: (data) => {
        this.stats.set({
          totalUsers: data.summary.totalUsers,
          totalJobs: data.summary.totalJobs,
          totalCandidates: data.summary.totalCandidates
        });

        this.topSkills.set(data.skills || []);
        this.topEmployers.set(data.topEmployers || []);
        this.hiresByInstitution.set(data.hiresByInstitution || []);
        this.experience.set(data.experience || []);

        this.maxSkillCount = Math.max(...(data.skills || []).map(s => s.count), 1);
        this.maxExpCount = Math.max(...(data.experience || []).map(e => e.count), 1);
        this.maxInstCount = Math.max(...(data.hiresByInstitution || []).map(h => h.count), 1);
        this.maxEmployerCount = Math.max(...(data.topEmployers || []).map(e => e.count), 1);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.stats.set({ totalUsers: 0, totalJobs: 0, totalCandidates: 0 });
        this.isLoading.set(false);
      }
    });
  }

  getSkillPercentage(count: number): number {
    return Math.round((count / this.maxSkillCount) * 100);
  }

  getExpHeight(count: number): number {
    return Math.round((count / this.maxExpCount) * 180) + 20;
  }

  getInstPercentage(count: number): number {
    return Math.round((count / this.maxInstCount) * 100);
  }

  getEmployerPercentage(count: number): number {
    return Math.round((count / this.maxEmployerCount) * 100);
  }

  getSkillColorHex(index: number): string {
    return this.skillColors[index % this.skillColors.length];
  }

  getSkillGradient(index: number): string {
    const colors = [
      'linear-gradient(90deg, #3b82f6, #1d4ed8)',
      'linear-gradient(90deg, #8b5cf6, #6d28d9)',
      'linear-gradient(90deg, #ec4899, #be185d)',
      'linear-gradient(90deg, #f59e0b, #d97706)',
      'linear-gradient(90deg, #10b981, #047857)',
      'linear-gradient(90deg, #06b6d4, #0891b2)',
      'linear-gradient(90deg, #6366f1, #4338ca)',
      'linear-gradient(90deg, #f43f5e, #be123c)'
    ];
    return colors[index % colors.length];
  }

  getExpColor(index: number): string {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return colors[index % colors.length];
  }

  getExpColorLight(index: number): string {
    const colors = ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fcd34d', '#6ee7b7'];
    return colors[index % colors.length];
  }

  getTotalSkillCount(): number {
    return this.topSkills().reduce((sum, s) => sum + s.count, 0);
  }

  getDonutSegments(): { color: string, dashArray: string, dashOffset: string }[] {
    const skills = this.topSkills().slice(0, 6);
    const total = this.getTotalSkillCount();
    if (total === 0) return [];

    const circumference = 2 * Math.PI * 40; // radius = 40
    let offset = 0;

    return skills.map((skill, i) => {
      const percentage = skill.count / total;
      const length = circumference * percentage;
      const segment = {
        color: this.skillColors[i % this.skillColors.length],
        dashArray: `${length} ${circumference - length}`,
        dashOffset: `-${offset}`
      };
      offset += length;
      return segment;
    });
  }
}
