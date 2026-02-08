
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-candidate-profile-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
                 
                 <!-- Skills -->
                 <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-3">Skills</label>
                    <div class="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                        <div *ngFor="let skill of skills.controls; let i=index" class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm transition-all hover:bg-blue-100">
                            {{ skill.value }}
                            <button type="button" (click)="removeSkill(i)" class="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div *ngIf="skills.length === 0" class="text-slate-400 text-sm italic py-1.5 px-3">
                            No skills added yet. Click 'Add Skills' to select from the list.
                        </div>
                    </div>
                    
                    <button type="button" (click)="openSkillModal()" class="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-100">
                        <svg class="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Add Skills
                    </button>
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

      <!-- Skills Modal -->
      <div *ngIf="showSkillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" (click)="closeSkillModal()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="text-lg font-bold text-slate-800">Select Skills</h3>
                <button (click)="closeSkillModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div class="mb-4">
                    <input #searchInput type="text" placeholder="Search skills..." (input)="filterSkills(searchInput.value)" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all">
                    <div class="absolute mt-[-38px] ml-3 text-slate-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button *ngFor="let skill of filteredAvailableSkills" 
                            (click)="toggleSkill(skill.name)"
                            [class.bg-blue-50]="hasSkill(skill.name)"
                            [class.border-blue-200]="hasSkill(skill.name)"
                            [class.text-blue-700]="hasSkill(skill.name)"
                            class="text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between group">
                        <span class="font-medium truncate">{{ skill.name }}</span>
                        <span *ngIf="hasSkill(skill.name)" class="text-blue-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </span>
                    </button>
                </div>
                
                <div *ngIf="filteredAvailableSkills.length === 0" class="text-center py-8 text-slate-500">
                    No skills found fitting your search.
                </div>
            </div>
            
            <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                 <button (click)="closeSkillModal()" class="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                    Done
                </button>
            </div>
        </div>
      </div>
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

    // Skill Modal
    showSkillModal = false;

    // Default fallback skills from registration
    defaultSkills = [
        // Frontend & Markup
        { name: 'HTML', category: 'Frontend' },
        { name: 'CSS', category: 'Frontend' },
        { name: 'Sass (SCSS)', category: 'Frontend' },
        { name: 'Less', category: 'Frontend' },
        { name: 'XML', category: 'Frontend' },
        { name: 'JavaScript', category: 'Frontend' },
        { name: 'TypeScript', category: 'Frontend' },
        { name: 'Angular', category: 'Frontend' },
        { name: 'React', category: 'Frontend' },
        { name: 'Vue.js', category: 'Frontend' },
        { name: 'Svelte', category: 'Frontend' },
        { name: 'Next.js', category: 'Frontend' },
        { name: 'Nuxt.js', category: 'Frontend' },
        { name: 'Tailwind CSS', category: 'Frontend' },
        { name: 'Bootstrap', category: 'Frontend' },

        // Backend & Languages
        { name: 'Node.js', category: 'Backend' },
        { name: 'Python', category: 'Backend' },
        { name: 'Java', category: 'Backend' },
        { name: 'C#', category: 'Backend' },
        { name: 'C++', category: 'Backend' },
        { name: 'Go (Golang)', category: 'Backend' },
        { name: 'Rust', category: 'Backend' },
        { name: 'Ruby', category: 'Backend' },
        { name: 'PHP', category: 'Backend' },
        { name: 'Swift', category: 'Mobile' },
        { name: 'Kotlin', category: 'Mobile' },
        { name: 'Dart', category: 'Mobile' },

        // Frameworks
        { name: 'Django', category: 'Backend' },
        { name: 'Flask', category: 'Backend' },
        { name: 'Spring Boot', category: 'Backend' },
        { name: 'Laravel', category: 'Backend' },
        { name: 'Express.js', category: 'Backend' },
        { name: 'NestJS', category: 'Backend' },
        { name: 'ASP.NET Core', category: 'Backend' },

        // Mobile
        { name: 'React Native', category: 'Mobile' },
        { name: 'Flutter', category: 'Mobile' },
        { name: 'SwiftUI', category: 'Mobile' },

        // Database
        { name: 'SQL', category: 'Database' },
        { name: 'MySQL', category: 'Database' },
        { name: 'PostgreSQL', category: 'Database' },
        { name: 'MongoDB', category: 'Database' },
        { name: 'Redis', category: 'Database' },
        { name: 'Elasticsearch', category: 'Database' },
        { name: 'Firebase', category: 'Database' },

        // DevOps & Cloud
        { name: 'AWS', category: 'DevOps' },
        { name: 'Azure', category: 'DevOps' },
        { name: 'Google Cloud (GCP)', category: 'DevOps' },
        { name: 'Docker', category: 'DevOps' },
        { name: 'Kubernetes', category: 'DevOps' },
        { name: 'Jenkins', category: 'DevOps' },
        { name: 'Git', category: 'Tools' },
        { name: 'CI/CD', category: 'DevOps' },
        { name: 'Terraform', category: 'DevOps' },
        { name: 'Ansible', category: 'DevOps' },

        // Design
        { name: 'Figma', category: 'Design' },
        { name: 'Adobe XD', category: 'Design' },
        { name: 'Sketch', category: 'Design' }
    ];

    availableSkills: any[] = [];
    filteredAvailableSkills: any[] = [];

    constructor() {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            bio: [''],
            experience: [0, [Validators.min(0)]],
            currentTitle: ['Open to Work'],
            skills: this.fb.array([]),
            school: [''],
            department: ['']
        });
    }

    get skills() {
        return this.profileForm.get('skills') as FormArray;
    }

    ngOnInit() {
        this.loadProfile();
        this.fetchAvailableSkills();
    }

    async fetchAvailableSkills() {
        try {
            const skills = await this.http.get<any[]>(`${environment.apiUrl}/skills`).toPromise();

            // Merge fetched skills with default skills, avoiding duplicates based on name
            const mergedSkills = [...this.defaultSkills];

            if (skills && Array.isArray(skills)) {
                skills.forEach(backendSkill => {
                    if (!mergedSkills.some(s => s.name.toLowerCase() === backendSkill.name.toLowerCase())) {
                        mergedSkills.push(backendSkill);
                    }
                });
            }

            this.availableSkills = mergedSkills;
            this.filteredAvailableSkills = mergedSkills;

        } catch (error) {
            console.error('Failed to load skills from backend, using defaults', error);
            // Fallback to defaults
            this.availableSkills = this.defaultSkills;
            this.filteredAvailableSkills = this.defaultSkills;
        }
    }

    async loadProfile() {
        this.isLoading.set(true);
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;

        try {
            const candidateProfile = await this.http.get<any>(`${environment.apiUrl}/candidates/user/${userId}`).toPromise();

            if (candidateProfile) {
                this.candidateId = candidateProfile._id;
                this.profileForm.patchValue({
                    firstName: candidateProfile.firstName,
                    lastName: candidateProfile.lastName,
                    email: candidateProfile.email,
                    bio: candidateProfile.bio,
                    experience: candidateProfile.experience,
                    currentTitle: candidateProfile.currentTitle || 'Open to Work',
                    school: candidateProfile.school,
                    department: candidateProfile.department
                });

                // Populate skills
                const currentSkills = candidateProfile.skills || [];
                currentSkills.forEach((skill: string) => {
                    this.skills.push(this.fb.control(skill));
                });
            }
        } catch (error) {
            console.error('Error loading profile', error);
            this.toastService.show('Could not load profile data', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }

    // Modal Logic
    openSkillModal() {
        this.showSkillModal = true;
        // Reset filter when opening
        this.filteredAvailableSkills = this.availableSkills;
    }

    closeSkillModal() {
        this.showSkillModal = false;
    }

    filterSkills(query: string) {
        if (!query) {
            this.filteredAvailableSkills = this.availableSkills;
            return;
        }
        this.filteredAvailableSkills = this.availableSkills.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    hasSkill(skillName: string): boolean {
        return this.skills.controls.some(control => control.value === skillName);
    }

    toggleSkill(skillName: string) {
        if (this.hasSkill(skillName)) {
            // Remove
            const index = this.skills.controls.findIndex(c => c.value === skillName);
            if (index !== -1) this.removeSkill(index);
        } else {
            // Add
            this.skills.push(this.fb.control(skillName));
        }
    }

    removeSkill(index: number) {
        this.skills.removeAt(index);
    }

    onSubmit() {
        if (this.profileForm.invalid || !this.candidateId) return;

        this.isLoading.set(true);
        const formData = this.profileForm.getRawValue();

        this.http.put(`${environment.apiUrl}/candidates/${this.candidateId}`, formData).subscribe({
            next: () => {
                this.toastService.show('Profile updated successfully!', 'success');
                setTimeout(() => {
                    this.router.navigate(['/candidate/dashboard']);
                }, 1000);
            },
            error: (err) => {
                console.error('Update failed', err);
                this.toastService.show('Failed to update profile.', 'error');
                this.isLoading.set(false);
            },
            complete: () => this.isLoading.set(false)
        });
    }
}
