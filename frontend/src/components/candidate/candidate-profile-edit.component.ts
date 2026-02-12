
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../environments/environment';
import { SkillSelectorComponent } from '../shared/skill-selector.component';
import { DEFAULT_SKILLS, Skill } from '../../config/skills.config';

@Component({
    selector: 'app-candidate-profile-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, SkillSelectorComponent],
    template: `
    <div class="min-h-screen bg-slate-50 py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                <p class="text-slate-500 mt-2">Update your professional information to get better matches.</p>
            </div>
            <button routerLink="/candidate/dashboard" class="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Back to Dashboard
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="p-8">
            
            <!-- Personal Info -->
            <div class="space-y-8 mb-10">
                <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </span>
                    Personal Details
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                        <input formControlName="firstName" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                        <input formControlName="lastName" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all">
                    </div>
                    <div class="col-span-full">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input formControlName="email" type="email" class="w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed py-3 px-4 focus:ring-0" readonly>
                        <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Email cannot be changed directly. Contact support for assistance.
                        </p>
                    </div>
                     <div class="col-span-full">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                        <textarea formControlName="bio" rows="4" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all" placeholder="Tell us about yourself, your goals, and what makes you a unique candidate..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Professional Info -->
            <div class="space-y-8 mb-10">
                <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span class="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </span>
                    Professional Info
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
                        <input formControlName="experience" type="number" min="0" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Current Title</label>
                         <div class="relative">
                            <select formControlName="currentTitle" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 appearance-none transition-all">
                                <option value="" disabled>Select your current title</option>
                                <option value="Open to Work">Open to Work</option>
                                <option value="Student">Student</option>
                                <option value="Employed">Employed</option>
                                <option value="Freelancer">Freelancer</option>
                                <option value="Intern">Intern</option>
                            </select>
                             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                 
                 <!-- Skills Categorization -->
                 <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                           <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                           Primary Skills (Your Strengths)
                        </label>
                        <div class="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                            <div *ngFor="let skill of primarySkills.controls; let i=index" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm transition-all hover:bg-emerald-100">
                                {{ skill.value }}
                                <button type="button" (click)="removeSkill(i, 'primary')" class="ml-2 text-emerald-400 hover:text-emerald-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <button type="button" (click)="openSkillModal('primary')" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline px-1">Add Primary Skills</button>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                           <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                           Secondary Skills (Working Knowledge)
                        </label>
                        <div class="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                            <div *ngFor="let skill of secondarySkills.controls; let i=index" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm transition-all hover:bg-blue-100">
                                {{ skill.value }}
                                <button type="button" (click)="removeSkill(i, 'secondary')" class="ml-2 text-blue-400 hover:text-blue-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <button type="button" (click)="openSkillModal('secondary')" class="text-xs font-semibold text-blue-600 hover:text-blue-700 underline px-1">Add Secondary Skills</button>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                           <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                           Soft Skills
                        </label>
                        <div class="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                            <div *ngFor="let skill of softSkills.controls; let i=index" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100 shadow-sm transition-all hover:bg-purple-100">
                                {{ skill.value }}
                                <button type="button" (click)="removeSkill(i, 'soft')" class="ml-2 text-purple-400 hover:text-purple-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <button type="button" (click)="openSkillModal('soft')" class="text-xs font-semibold text-purple-600 hover:text-purple-700 underline px-1">Add Soft Skills</button>
                    </div>
                 </div>
            </div>

             <!-- Education -->
            <div class="space-y-8 mb-10">
                <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span class="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
                    </span>
                    Education
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">School / University</label>
                        <input formControlName="school" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Department / Major</label>
                        <input formControlName="department" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 transition-all">
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-4 pt-8 border-t border-slate-100">
                <button type="button" routerLink="/candidate/dashboard" class="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors">
                    Cancel
                </button>
                <button type="submit" [disabled]="profileForm.invalid || isLoading()" 
                        class="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-70 flex items-center gap-2 transform active:scale-95">
                    <span *ngIf="isLoading()" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Save Changes
                </button>
            </div>

          </form>
        </div>
      </div>

      <!-- Skill Selector Modal -->
      <app-skill-selector 
        *ngIf="showSkillModal"
        [categoryTitle]="getModalTitle()"
        [selectedSkills]="getCurrentlySelectedSkills()"
        [skillType]="getModalSkillType()"
        (skillToggled)="toggleSkill($event)"
        (close)="closeSkillModal()">
      </app-skill-selector>
    </div>
  `
})
export class CandidateProfileEditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    profileForm: FormGroup;
    isLoading = signal(false);
    candidateId: string | null = null;

    // Skill Modal State
    showSkillModal = false;
    currentModalCategory: 'primary' | 'secondary' | 'soft' = 'primary';

    constructor() {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            bio: [''],
            experience: [0, [Validators.min(0)]],
            currentTitle: ['Open to Work'],
            skills: this.fb.array([]), // Legacy maintenance
            primarySkills: this.fb.array([]),
            secondarySkills: this.fb.array([]),
            softSkills: this.fb.array([]),
            school: [''],
            department: ['']
        });
    }

    get skills() { return this.profileForm.get('skills') as FormArray; }
    get primarySkills() { return this.profileForm.get('primarySkills') as FormArray; }
    get secondarySkills() { return this.profileForm.get('secondarySkills') as FormArray; }
    get softSkills() { return this.profileForm.get('softSkills') as FormArray; }

    ngOnInit() {
        this.loadProfile();
    }

    async loadProfile() {
        this.isLoading.set(true);
        const user = this.authService.currentUser();
        if (!user || !user.id) {
            this.toastService.show('User session not found', 'error');
            return;
        }

        try {
            const profile = await this.http.get<any>(`${environment.apiUrl}/candidates/user/${user.id}`).toPromise();

            if (profile) {
                this.candidateId = profile._id;
                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    bio: profile.bio || '',
                    experience: profile.experience || 0,
                    currentTitle: profile.currentTitle || 'Open to Work',
                    school: profile.school || '',
                    department: profile.department || ''
                });

                // Populate skills arrays
                this.populateSkills(profile.primarySkills, this.primarySkills);
                this.populateSkills(profile.secondarySkills, this.secondarySkills);
                this.populateSkills(profile.softSkills, this.softSkills);
            }
        } catch (error) {
            console.error('Error loading profile', error);
            this.toastService.show('Failed to load profile', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }

    private populateSkills(skills: string[], array: FormArray) {
        array.clear();
        (skills || []).forEach(s => array.push(this.fb.control(s)));
    }

    // Modal Logic
    openSkillModal(category: 'primary' | 'secondary' | 'soft') {
        this.currentModalCategory = category;
        this.showSkillModal = true;
    }

    closeSkillModal() {
        this.showSkillModal = false;
    }

    getModalTitle(): string {
        switch (this.currentModalCategory) {
            case 'primary': return 'Primary Skills';
            case 'secondary': return 'Secondary Skills';
            case 'soft': return 'Soft Skills';
            default: return 'Skills';
        }
    }

    getModalSkillType(): 'technical' | 'soft' | 'all' {
        return this.currentModalCategory === 'soft' ? 'soft' : 'technical';
    }

    getCurrentlySelectedSkills(): string[] {
        const array = (this as any)[this.currentModalCategory + 'Skills'] as FormArray;
        return array.controls.map(c => c.value);
    }

    toggleSkill(skillName: string) {
        const array = (this as any)[this.currentModalCategory + 'Skills'] as FormArray;
        const index = array.controls.findIndex(c => c.value === skillName);

        if (index >= 0) {
            array.removeAt(index);
        } else {
            array.push(this.fb.control(skillName));
        }
    }

    removeSkill(index: number, category: 'primary' | 'secondary' | 'soft') {
        const array = (this as any)[category + 'Skills'] as FormArray;
        array.removeAt(index);
    }

    onSubmit() {
        if (this.profileForm.invalid || !this.candidateId) return;

        this.isLoading.set(true);
        const formData = this.profileForm.getRawValue();

        // Sync generic 'skills' for matching logic compatibility
        formData.skills = [
            ...formData.primarySkills,
            ...formData.secondarySkills,
            ...formData.softSkills
        ];

        this.http.put(`${environment.apiUrl}/candidates/${this.candidateId}`, formData)
            .subscribe({
                next: () => {
                    this.toastService.show('Profile updated successfully', 'success');
                    this.router.navigate(['/candidate/dashboard']);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.toastService.show('Failed to update profile', 'error');
                },
                complete: () => this.isLoading.set(false)
            });
    }
}
