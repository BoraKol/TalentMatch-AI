import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-skill-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ isEditMode() ? 'Edit Skill' : 'Add Skill' }}</h1>

        <!-- Option Selection (Only show in create mode) -->
        <div *ngIf="!isEditMode()" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <p class="text-sm font-medium text-slate-700 mb-4">Select one option to add a skill:</p>
          <div class="flex gap-4">
            <button (click)="setMode('manual')" 
                    [class]="mode() === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'"
                    class="flex-1 py-3 px-4 rounded-lg font-medium transition-colors">
              Add Manually
            </button>
            <button (click)="setMode('csv')" 
                    [class]="mode() === 'csv' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'"
                    class="flex-1 py-3 px-4 rounded-lg font-medium transition-colors">
              Upload Excel File (XLSX)
            </button>
          </div>
        </div>

        <!-- Manual Add Form -->
        <div *ngIf="mode() === 'manual' || isEditMode()" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Skill Name -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Skill Name <span class="text-red-500">*</span>
                </label>
                <input type="text" formControlName="name"
                       class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="e.g., JavaScript">
                <p *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']" 
                   class="text-red-500 text-sm mt-1">Skill name is required</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Skill Type
                </label>
                <select formControlName="skillType"
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="soft">Soft Skill</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <input type="text" formControlName="category"
                         class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         placeholder="e.g., Software Development">
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Subcategory
                  </label>
                  <input type="text" formControlName="subcategory"
                         class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         placeholder="e.g., Frontend">
                </div>
            </div>

            <!-- Active Checkbox -->
            <div class="mb-6">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="isActive"
                       class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-4">
              <a routerLink="/admin/settings/skills" 
                 class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </a>
              <button type="submit" [disabled]="isLoading()"
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isLoading() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>

        <!-- CSV Upload (Only show in create mode) -->
        <div *ngIf="mode() === 'csv' && !isEditMode()" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Upload Skills via CSV/Excel</h3>
            <p class="text-sm text-slate-600 mb-4">
              First, generate a file with all existing skills, then add new skills. 
              Or download the template, remove all rows except the header, and add new skills.
            </p>
            
            <div class="flex gap-4 mb-6">
              <button (click)="downloadTemplate()" 
                      class="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Download Template
              </button>
              <button (click)="exportExisting()" 
                      class="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                Export Existing Skills
              </button>
            </div>

            <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input type="file" (change)="onFileSelect($event)" accept=".csv,.xlsx" id="file-upload" class="hidden">
              <label for="file-upload" class="cursor-pointer">
                <svg class="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-slate-600">Click to upload or drag and drop</p>
                <p class="text-sm text-slate-400 mt-1">CSV or XLSX files only</p>
              </label>
            </div>

            <div *ngIf="selectedFileName()" class="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
              <span class="text-sm text-slate-700">{{ selectedFileName() }}</span>
              <button (click)="uploadFile()" [disabled]="isUploading()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ isUploading() ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </div>

          <!-- Error/Success Messages -->
          <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ errorMessage() }}
          </div>
          <div *ngIf="successMessage()" class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
            {{ successMessage() }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class SkillCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', Validators.required],
    category: [''],
    subcategory: [''],
    skillType: ['primary'],
    isActive: [true]
  });

  mode = signal<'manual' | 'csv'>('manual');
  isLoading = signal(false);
  isUploading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedFileName = signal('');
  selectedFile: File | null = null;
  isEditMode = signal(false);
  skillId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.skillId.set(id);
      this.loadSkill(id);
    }
  }

  loadSkill(id: string) {
    this.http.get<any>(`${environment.apiUrl}/skills/${id}`).subscribe({
      next: (data) => {
        this.form.patchValue({
          name: data.name,
          category: data.category || '',
          subcategory: data.subcategory || '',
          skillType: data.skillType || 'primary',
          isActive: data.isActive
        });
      },
      error: () => this.errorMessage.set('Failed to load skill')
    });
  }

  setMode(m: 'manual' | 'csv') {
    this.mode.set(m);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const request = this.isEditMode()
        ? this.http.put(`${environment.apiUrl}/skills/${this.skillId()}`, this.form.value)
        : this.http.post(`${environment.apiUrl}/skills`, this.form.value);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/admin/settings/skills']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to save skill');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName.set(file.name);
    }
  }

  downloadTemplate() {
    const csv = 'name,isActive\nJavaScript,true\nPython,true\nReact,true';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportExisting() {
    this.http.get<any[]>(`${environment.apiUrl}/skills`).subscribe({
      next: (skills) => {
        const csv = 'name,isActive\n' + skills.map(s => `${s.name},${s.isActive}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'existing_skills.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set('Failed to export skills')
    });
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.apiUrl}/skills/import`, formData).subscribe({
      next: (res: any) => {
        this.isUploading.set(false);
        this.successMessage.set(res.message || 'Skills imported successfully!');
        setTimeout(() => this.router.navigate(['/admin/settings/skills']), 2000);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to import skills');
      }
    });
  }
}
