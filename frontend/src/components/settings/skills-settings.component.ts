import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Skill } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-skills-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="animate-fade-in space-y-6">
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
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500 whitespace-nowrap">
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
      </div>
  `
})
export class SkillsSettingsComponent implements OnInit {
    settingsService = inject(SettingsService);
    toastService = inject(ToastService);

    skills = this.settingsService.skills;
    newSkillName = '';
    newSkillCategory = 'Frontend';

    ngOnInit() {
        this.settingsService.getSkills().subscribe();
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
}
