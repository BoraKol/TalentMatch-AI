import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-testimonial-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-slate-800 mb-6">
          {{ isEditMode() ? 'Edit Testimonial' : 'Add Testimonial' }}
        </h1>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Title -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="title"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., CEO at TechCorp">
              <p *ngIf="form.get('title')?.touched && form.get('title')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Title is required</p>
            </div>

            <!-- Content -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Content <span class="text-red-500">*</span>
              </label>
              <textarea formControlName="content" rows="4"
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter testimonial content..."></textarea>
              <p *ngIf="form.get('content')?.touched && form.get('content')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Content is required</p>
            </div>

            <!-- Name -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Name <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="authorName"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="e.g., John Smith">
              <p *ngIf="form.get('authorName')?.touched && form.get('authorName')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Name is required</p>
            </div>

            <!-- Image Upload -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Image <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-4">
                <img *ngIf="imagePreview()" [src]="imagePreview()" class="w-16 h-16 rounded-full object-cover">
                <div class="flex-1">
                  <input type="file" (change)="onFileSelect($event)" accept="image/*"
                         class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                </div>
              </div>
              <p *ngIf="form.get('avatarUrl')?.touched && form.get('avatarUrl')?.errors?.['required']" 
                 class="text-red-500 text-sm mt-1">Image is required</p>
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

            <!-- Success Message -->
            <div *ngIf="successMessage()" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              {{ successMessage() }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-4">
              <a routerLink="/admin/testimonials/list" 
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
export class TestimonialCreateComponent implements OnInit {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form = this.fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required],
        authorName: ['', Validators.required],
        avatarUrl: ['', Validators.required],
        isActive: [true]
    });

    isLoading = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    isEditMode = signal(false);
    testimonialId = signal<string | null>(null);
    imagePreview = signal<string>('');
    selectedFile: File | null = null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.testimonialId.set(id);
            this.loadTestimonial(id);
        }
    }

    loadTestimonial(id: string) {
        this.http.get<any>(`${environment.apiUrl}/testimonials/${id}`).subscribe({
            next: (data) => {
                this.form.patchValue({
                    title: data.title || data.role,
                    content: data.content,
                    authorName: data.authorName,
                    avatarUrl: data.avatarUrl,
                    isActive: data.isActive
                });
                if (data.avatarUrl) {
                    this.imagePreview.set(data.avatarUrl);
                }
            },
            error: () => this.errorMessage.set('Failed to load testimonial')
        });
    }

    onFileSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                this.imagePreview.set(result);
                this.form.patchValue({ avatarUrl: result });
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.form.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');
            this.successMessage.set('');

            const data = {
                ...this.form.value,
                role: this.form.value.title // Map title to role for backend compatibility
            };

            const request = this.isEditMode()
                ? this.http.put(`${environment.apiUrl}/testimonials/${this.testimonialId()}`, data)
                : this.http.post(`${environment.apiUrl}/testimonials`, data);

            request.subscribe({
                next: () => {
                    this.successMessage.set(this.isEditMode() ? 'Testimonial updated!' : 'Testimonial created!');
                    this.isLoading.set(false);
                    setTimeout(() => this.router.navigate(['/admin/testimonials/list']), 1500);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.error || 'Failed to save testimonial');
                }
            });
        } else {
            this.form.markAllAsTouched();
        }
    }
}
