import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Total Candidates</p>
            <h3 class="text-3xl font-bold text-slate-800">{{ dashboardData()?.summary?.totalCandidates || 0 }}</h3>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Active Jobs</p>
            <h3 class="text-3xl font-bold text-slate-800">{{ dashboardData()?.summary?.totalJobs || 0 }}</h3>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">System Users</p>
            <h3 class="text-3xl font-bold text-slate-800">{{ dashboardData()?.summary?.totalUsers || 0 }}</h3>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Skills Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 class="text-lg font-bold text-slate-800 mb-6">Top Skills Demand</h3>
           <div class="h-[300px] flex items-center justify-center">
             @if(barChartData.datasets[0].data.length > 0) {
                <canvas baseChart
                    [data]="barChartData"
                    [options]="barChartOptions"
                    [type]="'bar'">
                </canvas>
             } @else {
                <p class="text-slate-400">Loading chart data...</p>
             }
           </div>
        </div>

        <!-- Experience Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 class="text-lg font-bold text-slate-800 mb-6">Experience Distribution</h3>
           <div class="h-[300px] flex items-center justify-center">
             @if(pieChartData.datasets[0].data.length > 0) {
               <canvas baseChart
                    [data]="pieChartData"
                    [options]="pieChartOptions"
                    [type]="'pie'">
                </canvas>
             } @else {
                <p class="text-slate-400">Loading chart data...</p>
             }
           </div>
        </div>

      </div>

      <!-- Institutions & Employers Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Hires by Institution -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 class="text-lg font-bold text-slate-800 mb-6">Hires by Institution</h3>
           <div class="h-[300px] flex items-center justify-center">
             @if(institutionChartData.datasets[0].data.length > 0) {
                <canvas baseChart
                    [data]="institutionChartData"
                    [options]="barChartOptions"
                    [type]="'bar'">
                </canvas>
             } @else {
                <p class="text-slate-400">Loading chart data...</p>
             }
           </div>
        </div>

        <!-- Top Employers -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 class="text-lg font-bold text-slate-800 mb-6">Top Hiring Employers</h3>
           <div class="h-[300px] flex items-center justify-center">
             @if(employerChartData.datasets[0].data.length > 0) {
               <canvas baseChart
                    [data]="employerChartData"
                    [options]="pieChartOptions"
                    [type]="'doughnut'">
                </canvas>
             } @else {
                <p class="text-slate-400">Loading chart data...</p>
             }
           </div>
        </div>

      </div>

    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private dataService = inject(DataService);
  dashboardData = signal<any>(null);

  // Bar Chart (Skills)
  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Candidates per Skill', backgroundColor: '#3b82f6' }] };
  barChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  // Pie Chart (Experience)
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  pieChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  // New Charts
  institutionChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Hires', backgroundColor: '#8b5cf6' }] };
  employerChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const data = await this.dataService.getAnalytics();
      this.dashboardData.set(data);

      // Update Charts
      this.barChartData = {
        labels: data.skills.map((s: any) => s.name),
        datasets: [{ data: data.skills.map((s: any) => s.count), label: 'Candidates', backgroundColor: '#3b82f6', borderRadius: 4 }]
      };

      this.pieChartData = {
        labels: data.experience.map((e: any) => e.range),
        datasets: [{
          data: data.experience.map((e: any) => e.count),
          backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6']
        }]
      };

      this.institutionChartData = {
        labels: data.hiresByInstitution.map((h: any) => h.name),
        datasets: [{ data: data.hiresByInstitution.map((h: any) => h.count), label: 'Hired Candidates', backgroundColor: '#8b5cf6', borderRadius: 4 }]
      };

      this.employerChartData = {
        labels: data.topEmployers.map((e: any) => e.name),
        datasets: [{
          data: data.topEmployers.map((e: any) => e.count),
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4']
        }]
      };

    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  }
}
