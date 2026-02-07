import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-institution-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-slate-800 mb-6">
          {{ isEditMode() ? 'Edit Institution' : 'Add Institution' }}
        </h1>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Institution Name -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Institution Name <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="name"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., Massachusetts Institute of Technology">
              <p *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Institution name is required</p>
            </div>

            <!-- Email Domains -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Email Domains (comma separated) <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="emailDomain"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., mit.edu, alum.mit.edu">
              <p class="text-slate-500 text-xs mt-1">Separate multiple domains with commas</p>
              <p *ngIf="form.get('emailDomain')?.touched && form.get('emailDomain')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Email domain is required</p>
            </div>

            <!-- Admin Email -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Admin Email Address <span class="text-red-500">*</span>
              </label>
              <input type="email" formControlName="adminEmail"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., admin@mit.edu">
              <p class="text-slate-500 text-xs mt-1">This email will receive the invitation to set up the admin account</p>
              <p *ngIf="form.get('adminEmail')?.touched && form.get('adminEmail')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Admin email is required</p>
              <p *ngIf="form.get('adminEmail')?.touched && form.get('adminEmail')?.errors?.['email']" 
                 class="text-red-500 text-sm mt-1">Please enter a valid email</p>
            </div>

            <!-- Status -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Status <span class="text-red-500">*</span>
              </label>
              <select formControlName="status"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <p *ngIf="form.get('status')?.touched && form.get('status')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Status is required</p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage()" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              {{ successMessage() }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-4">
              <a routerLink="/admin/institutions/list" 
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
export class InstitutionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', Validators.required],
    emailDomain: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    status: ['pending', Validators.required]
  });

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isEditMode = signal(false);
  institutionId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.institutionId.set(id);
      this.loadInstitution(id);
    }
  }

  loadInstitution(id: string) {
    this.http.get<any>(`${environment.apiUrl}/institutions/${id}`).subscribe({
      next: (data) => {
        this.form.patchValue({
          name: data.name,
          emailDomain: data.emailDomain,
          adminEmail: data.adminEmail,
          status: data.status
        });
      },
      error: () => this.errorMessage.set('Failed to load institution')
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      // Status is now handled by the form
      const data = this.form.value;

      const request = this.isEditMode()
        ? this.http.put(`${environment.apiUrl}/institutions/${this.institutionId()}`, data)
        : this.http.post(`${environment.apiUrl}/institutions`, data);

      request.subscribe({
        next: () => {
          this.successMessage.set(this.isEditMode() ? 'Institution updated!' : 'Institution created! Invitation email sent to admin.');
          this.isLoading.set(false);
          setTimeout(() => this.router.navigate(['/admin/institutions/list']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to save institution');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
