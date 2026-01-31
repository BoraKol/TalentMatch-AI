import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-800">Algorithm Settings</h2>
        <p class="text-slate-500 mt-1">Configure how the AI prioritizes candidate skills during the matching process.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-semibold text-slate-700">Scoring Weights</h3>
          <p class="text-sm text-slate-500">Assign points to different match criteria. Higher points = higher relevance.</p>
        </div>
        
        <div class="p-6 grid gap-6 md:grid-cols-2">
          <!-- Primary Skills -->
          <div class="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Primary Skills Points</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="50" [(ngModel)]="settings.primarySkillPoints" class="w-full accent-blue-600 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-blue-700 w-8">{{ settings.primarySkillPoints }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">Weight for exact matches on required job skills.</p>
          </div>

          <!-- Secondary Skills -->
          <div class="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Secondary Skills Points</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="30" [(ngModel)]="settings.secondarySkillPoints" class="w-full accent-indigo-600 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-indigo-700 w-8">{{ settings.secondarySkillPoints }}</span>
            </div>
             <p class="text-xs text-slate-500 mt-2">Weight for preferred but not mandatory skills.</p>
          </div>

          <!-- Soft Skills (Inferred by AI) -->
          <div class="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Soft Skills / Bio Match</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="20" [(ngModel)]="settings.softSkillPoints" class="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-emerald-700 w-8">{{ settings.softSkillPoints }}</span>
            </div>
             <p class="text-xs text-slate-500 mt-2">Points awarded when AI detects strong bio alignment.</p>
          </div>

           <!-- Nice to Have -->
           <div class="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Nice-to-Have Bonus</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="10" [(ngModel)]="settings.niceToHavePoints" class="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-amber-700 w-8">{{ settings.niceToHavePoints }}</span>
            </div>
             <p class="text-xs text-slate-500 mt-2">Extra bonus for exceeding expectations.</p>
          </div>
        </div>
        
        <div class="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button (click)="saveSettings()" class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  dataService = inject(DataService);
  toastService = inject(ToastService);
  // Copy signal value to local mutable object for form binding
  settings = { ...this.dataService.algorithmSettings() };

  saveSettings() {
    this.dataService.updateSettings(this.settings);
    this.toastService.show('Algorithm settings updated successfully!', 'success');
  }
}