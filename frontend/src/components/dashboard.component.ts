import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, AnalyticsComponent],
    template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">Welcome Back, Super Admin</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Active Institutions</div>
          <div class="text-3xl font-black text-slate-800">12</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Candidates in Pool</div>
          <div class="text-3xl font-black text-slate-800">2,543</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="text-slate-500 text-sm font-medium uppercase mb-1">Open Positions</div>
          <div class="text-3xl font-black text-slate-800">48</div>
        </div>
      </div>

      <div class="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2">New: AI Direct Match is Live</h2>
          <p class="max-w-xl text-blue-100 mb-6">
            Our new feature analyzes candidate bios, experience, and soft skills to instantly invite the top 3 matches to interview.
          </p>
          <button (click)="navigateToMatch()" class="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors">
            Try AI Matching Now
          </button>
        </div>
        <!-- Decorative Circle -->
        <div class="absolute -right-10 -bottom-20 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <!-- Analytics Dashboard -->
      <div class="mt-8">
          <app-analytics></app-analytics>
      </div>
    </div>
  `
})
export class DashboardComponent {
    private router = inject(Router);

    navigateToMatch() {
        this.router.navigate(['/match']);
    }
}
