import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, EmploymentType } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-employment-types-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="animate-fade-in space-y-6">
         <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div class="flex gap-4">
                <input type="text" [(ngModel)]="newEmpName" placeholder="Type Name (e.g. Full-time)" class="flex-1 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                <input type="number" [(ngModel)]="newEmpLevel" placeholder="Level (1-10)" class="w-32 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                <button (click)="addEmploymentType()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Add Type</button>
             </div>
        </div>
         <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500 whitespace-nowrap">
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
export class EmploymentTypesSettingsComponent implements OnInit {
    settingsService = inject(SettingsService);
    toastService = inject(ToastService);

    employmentTypes = this.settingsService.employmentTypes;
    newEmpName = '';
    newEmpLevel = 1;

    ngOnInit() {
        this.settingsService.getEmploymentTypes().subscribe();
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
