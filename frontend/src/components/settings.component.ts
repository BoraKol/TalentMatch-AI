import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AlgorithmSettings, Skill, EmploymentType } from '../services/settings.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
           <h2 class="text-3xl font-bold text-slate-800">Platform Settings</h2>
           <p class="text-slate-500 mt-1">Configure global AI parameters and manage system data.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-1 rounded-xl bg-slate-100/80 p-1 mb-8 w-fit">
        <button (click)="activeTab.set('algorithm')" [class.bg-white]="activeTab() === 'algorithm'" [class.shadow]="activeTab() === 'algorithm'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all" [class.text-slate-600]="activeTab() !== 'algorithm'" [class.text-blue-600]="activeTab() === 'algorithm'">Algorithm Config</button>
        <button (click)="activeTab.set('skills')" [class.bg-white]="activeTab() === 'skills'" [class.shadow]="activeTab() === 'skills'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all" [class.text-slate-600]="activeTab() !== 'skills'" [class.text-blue-600]="activeTab() === 'skills'">Skills Master List</button>
        <button (click)="activeTab.set('employment')" [class.bg-white]="activeTab() === 'employment'" [class.shadow]="activeTab() === 'employment'" class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all" [class.text-slate-600]="activeTab() !== 'employment'" [class.text-blue-600]="activeTab() === 'employment'">Employment Types</button>
      </div>

      <!-- Content: Algorithm -->
      <div *ngIf="activeTab() === 'algorithm'" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-semibold text-slate-700">Scoring Weights</h3>
          <p class="text-sm text-slate-500">Assign points to different match criteria. Higher points = higher relevance.</p>
        </div>
        
        <div class="p-6 grid gap-6 md:grid-cols-2">
          <!-- Primary Skills -->
          <div class="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Primary Skills Points</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="50" [(ngModel)]="algorithmSettings.primarySkillPoints" class="w-full accent-blue-600 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-blue-700 w-8">{{ algorithmSettings.primarySkillPoints }}</span>
            </div>
          </div>
          <!-- Secondary Skills -->
          <div class="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Secondary Skills Points</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="30" [(ngModel)]="algorithmSettings.secondarySkillPoints" class="w-full accent-indigo-600 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-indigo-700 w-8">{{ algorithmSettings.secondarySkillPoints }}</span>
            </div>
          </div>
           <!-- Soft Skills -->
          <div class="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Soft Skills / Bio Match</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="20" [(ngModel)]="algorithmSettings.softSkillPoints" class="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-emerald-700 w-8">{{ algorithmSettings.softSkillPoints }}</span>
            </div>
          </div>
           <!-- Nice to Have -->
           <div class="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
            <label class="block text-sm font-medium text-slate-700 mb-2">Nice-to-Have Bonus</label>
            <div class="flex items-center gap-4">
              <input type="range" min="1" max="10" [(ngModel)]="algorithmSettings.niceToHavePoints" class="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer">
              <span class="text-lg font-bold text-amber-700 w-8">{{ algorithmSettings.niceToHavePoints }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button (click)="saveAlgorithmSettings()" class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-slate-900/10">Save Configuration</button>
        </div>
      </div>

       <!-- Content: Skills -->
      <div *ngIf="activeTab() === 'skills'" class="animate-fade-in space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div class="flex gap-4">
                <input type="text" [(ngModel)]="newSkillName" placeholder="Skill Name (e.g. Python)" class="flex-1 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                <select [(ngModel)]="newSkillCategory" class="rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Design">Design</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skill">Soft Skill</option>
                </select>
                <button (click)="addSkill()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Add Skill</button>
             </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-sm text-left text-slate-500">
                <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th class="px-6 py-3">Skill Name</th>
                        <th class="px-6 py-3">Category</th>
                        <th class="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let skill of skills()" class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ skill.name }}</td>
                        <td class="px-6 py-4">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ skill.category }}</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                             <button (click)="deleteSkill(skill._id!)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
                        </td>
                    </tr>
                    <tr *ngIf="skills().length === 0">
                        <td colspan="3" class="px-6 py-8 text-center text-slate-400">No skills found. Add your first skill above.</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

       <!-- Content: Employment Types -->
      <div *ngIf="activeTab() === 'employment'" class="animate-fade-in space-y-6">
         <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div class="flex gap-4">
                <input type="text" [(ngModel)]="newEmpName" placeholder="Type Name (e.g. Full-time)" class="flex-1 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                <input type="number" [(ngModel)]="newEmpLevel" placeholder="Level (1-10)" class="w-32 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                <button (click)="addEmploymentType()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Add Type</button>
             </div>
        </div>
         <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-sm text-left text-slate-500">
                <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th class="px-6 py-3">Employment Type</th>
                        <th class="px-6 py-3">Commitment Level</th>
                        <th class="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let type of employmentTypes()" class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ type.name }}</td>
                        <td class="px-6 py-4">{{ type.level }}</td>
                        <td class="px-6 py-4 text-right">
                             <button (click)="deleteEmploymentType(type._id!)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
                        </td>
                    </tr>
                     <tr *ngIf="employmentTypes().length === 0">
                        <td colspan="3" class="px-6 py-8 text-center text-slate-400">No employment types defined.</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

    </div>
  `
})
export class SettingsComponent implements OnInit {
  settingsService = inject(SettingsService);
  toastService = inject(ToastService);

  activeTab = signal<'algorithm' | 'skills' | 'employment'>('algorithm');

  // Local state for algorithm settings form (initially empty)
  algorithmSettings: AlgorithmSettings = {
    primarySkillPoints: 10,
    secondarySkillPoints: 5,
    softSkillPoints: 3,
    niceToHavePoints: 1
  };

  // Signals from Service
  skills = this.settingsService.skills;
  employmentTypes = this.settingsService.employmentTypes;

  // Form Inputs
  newSkillName = '';
  newSkillCategory = 'Frontend';
  newEmpName = '';
  newEmpLevel = 1;

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    // Load Algorithm Settings
    this.settingsService.getAlgorithmSettings().subscribe({
      next: (data) => this.algorithmSettings = { ...data },
      error: () => console.error('Failed to load settings')
    });

    // Load Lists
    this.settingsService.getSkills().subscribe();
    this.settingsService.getEmploymentTypes().subscribe();
  }

  saveAlgorithmSettings() {
    this.settingsService.updateAlgorithmSettings(this.algorithmSettings).subscribe({
      next: () => this.toastService.show('Configuration saved successfully!', 'success'),
      error: () => this.toastService.show('Failed to save configuration.', 'error')
    });
  }

  addSkill() {
    if (!this.newSkillName.trim()) return;

    const skill: Skill = { name: this.newSkillName, category: this.newSkillCategory };
    this.settingsService.addSkill(skill).subscribe({
      next: () => {
        this.toastService.show('Skill added successfully', 'success');
        this.newSkillName = '';
      },
      error: () => this.toastService.show('Failed to add skill', 'error')
    });
  }

  deleteSkill(id: string) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.settingsService.deleteSkill(id).subscribe({
        next: () => this.toastService.show('Skill deleted', 'success'),
        error: () => this.toastService.show('Failed to delete skill', 'error')
      });
    }
  }

  addEmploymentType() {
    if (!this.newEmpName.trim()) return;

    const type: EmploymentType = { name: this.newEmpName, level: this.newEmpLevel };
    this.settingsService.addEmploymentType(type).subscribe({
      next: () => {
        this.toastService.show('Employment type added', 'success');
        this.newEmpName = '';
      },
      error: () => this.toastService.show('Failed to add type', 'error')
    });
  }

  deleteEmploymentType(id: string) {
    if (confirm('Delete this employment type?')) {
      this.settingsService.deleteEmploymentType(id).subscribe({
        next: () => this.toastService.show('Type deleted', 'success'),
        error: () => this.toastService.show('Failed to delete type', 'error')
      });
    }
  }
}