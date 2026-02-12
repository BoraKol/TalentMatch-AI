import { Component, inject, EventEmitter, Output, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionService, Institution } from '../../services/institution.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-institution-create-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div class="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" (click)="onClose()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-slate-900 mb-4" id="modal-title">
              Add New Institution
            </h3>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                  <input formControlName="name" type="text" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select formControlName="type" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                      <option value="University">University</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Agency">Agency</option>
                  </select>
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Domain (e.g. mit.edu)</label>
                  <input formControlName="emailDomain" type="text" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                  <input formControlName="adminEmail" type="email" class="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                  <p class="text-xs text-slate-500 mt-1">An invitation will be sent to this email to set up the admin account.</p>
                </div>
              </div>
              
              <div class="mt-8 sm:flex sm:flex-row-reverse">
                <button type="submit" [disabled]="form.invalid || isSubmitting()" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                  {{ isSubmitting() ? 'Creating...' : 'Create & Invite' }}
                </button>
                <button type="button" (click)="onClose()" class="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InstitutionCreateModalComponent {
    instService = inject(InstitutionService);
    fb = inject(FormBuilder);
    toast = inject(ToastService);

    @Output() close = new EventEmitter<void>();

    isSubmitting = signal(false);

    form = this.fb.group({
        name: ['', Validators.required],
        type: ['University', Validators.required],
        emailDomain: ['', Validators.required],
        adminEmail: ['', [Validators.required, Validators.email]]
    });

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.form.valid) {
            this.isSubmitting.set(true);
            const val = this.form.value as Institution;
            val.status = 'pending';

            this.instService.create(val).subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.form.reset({ type: 'University' });
                    this.toast.show('Institution created and invite sent!', 'success');
                    this.close.emit();
                },
                error: () => {
                    this.isSubmitting.set(false);
                    this.toast.show('Failed to create institution.', 'error');
                }
            });
        }
    }
}
