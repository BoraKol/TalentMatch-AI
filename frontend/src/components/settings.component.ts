import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmSettingsComponent } from './settings/algorithm-settings.component';
import { SkillsSettingsComponent } from './settings/skills-settings.component';
import { EmploymentTypesSettingsComponent } from './settings/employment-types-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, AlgorithmSettingsComponent, SkillsSettingsComponent, EmploymentTypesSettingsComponent],
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
           <h2 class="text-3xl font-bold text-slate-800">Platform Settings</h2>
           <p class="text-slate-500 mt-1">Configure global AI parameters and manage system data.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="overflow-x-auto pb-2 mb-6">
        <div class="flex space-x-1 rounded-xl bg-slate-100/80 p-1 w-fit min-w-max">
            <button (click)="activeTab.set('algorithm')" [class.bg-white]="activeTab() === 'algorithm'" [class.shadow]="activeTab() === 'algorithm'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap" [class.text-slate-600]="activeTab() !== 'algorithm'" [class.text-blue-600]="activeTab() === 'algorithm'">Algorithm Config</button>
            <button (click)="activeTab.set('skills')" [class.bg-white]="activeTab() === 'skills'" [class.shadow]="activeTab() === 'skills'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap" [class.text-slate-600]="activeTab() !== 'skills'" [class.text-blue-600]="activeTab() === 'skills'">Skills Master List</button>
            <button (click)="activeTab.set('employment')" [class.bg-white]="activeTab() === 'employment'" [class.shadow]="activeTab() === 'employment'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap" [class.text-slate-600]="activeTab() !== 'employment'" [class.text-blue-600]="activeTab() === 'employment'">Employment Types</button>
        </div>
      </div>

      <!-- Content -->
      @switch (activeTab()) {
        @case ('algorithm') {
          <app-algorithm-settings></app-algorithm-settings>
        }
        @case ('skills') {
          <app-skills-settings></app-skills-settings>
        }
        @case ('employment') {
          <app-employment-types-settings></app-employment-types-settings>
        }
      }

    </div>
  `
})
export class SettingsComponent {
  activeTab = signal<'algorithm' | 'skills' | 'employment'>('algorithm');
}