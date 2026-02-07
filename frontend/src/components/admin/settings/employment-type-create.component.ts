import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employment-type-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ isEditMode() ? 'Edit' : 'Add' }} Employment Type</h1>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Name -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Name <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="name"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., Full Time">
              <p *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Name is required</p>
            </div>

            <!-- Level -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Level <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="level"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., Senior, Entry, Mid">
              <p *ngIf="form.get('level')?.touched && form.get('level')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Level is required</p>
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
              <a routerLink="/admin/settings/employment-types" 
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
      </div>
    </div>
  `
})
export class EmploymentTypeCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', Validators.required],
    level: ['', Validators.required],
    isActive: [true]
  });

  isLoading = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  employmentTypeId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employmentTypeId.set(id);
      this.loadEmploymentType(id);
    }
  }

  loadEmploymentType(id: string) {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/settings/employment-types/${id}`).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load employment type');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const request = this.isEditMode() && this.employmentTypeId()
        ? this.http.put(`${environment.apiUrl}/settings/employment-types/${this.employmentTypeId()}`, this.form.value)
        : this.http.post(`${environment.apiUrl}/settings/employment-types`, this.form.value);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/admin/settings/employment-types']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to save employment type');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
