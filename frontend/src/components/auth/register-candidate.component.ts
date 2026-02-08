import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GeographyService, Country } from '../../services/geography.service';

@Component({
  selector: 'app-register-candidate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-start justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-auto">
      <!-- Background Decorations -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div class="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div class="max-w-3xl w-full relative z-10">
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
            <h1 class="text-3xl font-extrabold tracking-tight">Create Your Candidate Profile</h1>
            <p class="mt-2 text-blue-100 font-medium">Join TalentMatch AI and let your dream job find you.</p>
          </div>

          <div class="p-8 sm:p-10">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-8">
              
              <!-- Errors -->
              <div *ngIf="errorMessage()" class="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="text-sm text-red-700 font-medium">{{ errorMessage() }}</div>
              </div>

              <!-- Section: Personal Info -->
              <div>
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <span class="w-8 h-px bg-slate-300"></span> Personal Information <span class="w-full h-px bg-slate-100"></span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">First Name</label>
                    <input formControlName="firstName" type="text" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" placeholder="Jane">
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Last Name</label>
                    <input formControlName="lastName" type="text" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" placeholder="Doe">
                  </div>
                </div>

                <div class="mt-6 space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Email Address</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input formControlName="email" type="email" class="block w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" placeholder="jane@example.com">
                  </div>
                </div>

                <div class="mt-6 space-y-1">
                  <label class="block text-sm font-medium text-slate-700">Password</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <input formControlName="password" [type]="showPassword() ? 'text' : 'password'" 
                           class="block w-full pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" 
                           placeholder="At least 6 characters">
                    
                     <!-- Eye Icon Toggle -->
                    <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                        <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                  </div>
                   <p *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')" class="mt-1 text-xs text-red-500">
                        Password must be at least 6 characters long.
                   </p>
                </div>
                
                 <div class="mt-6 space-y-1">
                   <label class="block text-sm font-medium text-slate-700">Bio / Summary</label>
                   <textarea formControlName="bio" rows="4" 
                             class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200 resize-none" 
                             placeholder="Briefly describe your professional background and career goals..."></textarea>
                 </div>
              </div>

              <!-- Section: Location & Edu -->
              <div>
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
                   <span class="w-8 h-px bg-slate-300"></span> Location & Education <span class="w-full h-px bg-slate-100"></span>
                </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Country</label>
                    <div class="relative">
                        <select formControlName="country" (change)="onCountryChange()" class="appearance-none block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200">
                            <option value="">Select Country</option>
                            <option *ngFor="let c of countries()" [value]="c.name">{{ c.name }}</option>
                        </select>
                         <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <!-- Spinner if loading countries -->
                            <svg *ngIf="isLoadingCountries()" class="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <!-- Chevron if not loading -->
                            <svg *ngIf="!isLoadingCountries()" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">City</label>
                    <div class="relative">
                        <select formControlName="region" class="appearance-none block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" 
                                [class.opacity-50]="!registerForm.get('country')?.value || isLoadingCities()">
                            <option value="">{{ isLoadingCities() ? 'Loading Cities...' : 'Select City' }}</option>
                            <option *ngFor="let c of cities()" [value]="c">{{ c }}</option>
                        </select>
                         <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                             <!-- Spinner if loading cities -->
                             <svg *ngIf="isLoadingCities()" class="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <!-- Chevron if not loading -->
                            <svg *ngIf="!isLoadingCities()" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">University</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <input formControlName="school" type="text" 
                               class="block w-full pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" 
                               placeholder="Enter your university name">
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-sm font-medium text-slate-700">Department</label>
                    <input formControlName="department" type="text" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 transition-all duration-200" placeholder="e.g. Computer Science">
                  </div>
                </div>
              </div>

              <!-- Skills Selection -->
              <div>
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
                   <span class="w-8 h-px bg-slate-300"></span> Technical Skills <span class="w-full h-px bg-slate-100"></span>
                </h3>
                
                <div class="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <div class="flex flex-wrap gap-2">
                    <label *ngFor="let skill of availableSkills" 
                        class="cursor-pointer relative group">
                      <input type="checkbox" [value]="skill.name" (change)="onSkillChange($event)" class="peer sr-only">
                      <div class="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 transition-all duration-200 
                                  peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 peer-checked:shadow-md
                                  hover:bg-slate-100 peer-checked:hover:bg-blue-700">
                        {{ skill.name }}
                      </div>
                    </label>
                  </div>
                  <p class="text-xs text-slate-500 mt-3 text-center">Select all technologies you are proficient in to help us match you better.</p>
                </div>
              </div>

              <div class="pt-4">
                <button type="submit" [disabled]="isLoading() || registerForm.invalid"
                  class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5">
                  <span *ngIf="isLoading()" class="mr-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ isLoading() ? 'Creating Your Profile...' : 'Complete Registration' }}
                </button>
              </div>
              
              <div class="text-center">
                  <p class="text-sm text-slate-600">
                    Already have an account? 
                    <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-500 transition-colors">Sign in here</a>
                  </p>
              </div>

            </form>
          </div>
        </div>
        
        <div class="text-center mt-8 text-sm text-slate-400">
            &copy; 2026 TalentMatch AI. All rights reserved.
        </div>
      </div>
    </div>
  `
})
export class RegisterCandidateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private geoService = inject(GeographyService);

  // Data Signals
  countries = signal<Country[]>([]);
  cities = signal<string[]>([]);

  isLoadingCountries = signal(false);
  isLoadingCities = signal(false);

  availableSkills = [
    // === TECHNICAL SKILLS ===
    // Software Development - Frontend
    { name: 'HTML', category: 'Software Development', skillType: 'technical' },
    { name: 'CSS', category: 'Software Development', skillType: 'technical' },
    { name: 'JavaScript', category: 'Software Development', skillType: 'technical' },
    { name: 'TypeScript', category: 'Software Development', skillType: 'technical' },
    { name: 'React', category: 'Software Development', skillType: 'technical' },
    { name: 'Angular', category: 'Software Development', skillType: 'technical' },
    { name: 'Vue.js', category: 'Software Development', skillType: 'technical' },
    { name: 'Next.js', category: 'Software Development', skillType: 'technical' },

    // Software Development - Backend
    { name: 'Node.js', category: 'Software Development', skillType: 'technical' },
    { name: 'Python', category: 'Software Development', skillType: 'technical' },
    { name: 'Java', category: 'Software Development', skillType: 'technical' },
    { name: 'C#', category: 'Software Development', skillType: 'technical' },
    { name: 'Go (Golang)', category: 'Software Development', skillType: 'technical' },

    // Mobile Development
    { name: 'React Native', category: 'Mobile Development', skillType: 'technical' },
    { name: 'Flutter', category: 'Mobile Development', skillType: 'technical' },
    { name: 'Swift', category: 'Mobile Development', skillType: 'technical' },
    { name: 'Kotlin', category: 'Mobile Development', skillType: 'technical' },

    // Data & AI
    { name: 'TensorFlow', category: 'Data & AI', skillType: 'technical' },
    { name: 'PyTorch', category: 'Data & AI', skillType: 'technical' },
    { name: 'Pandas', category: 'Data & AI', skillType: 'technical' },
    { name: 'OpenAI API', category: 'Data & AI', skillType: 'technical' },

    // Cloud & DevOps
    { name: 'AWS', category: 'Cloud & DevOps', skillType: 'technical' },
    { name: 'Azure', category: 'Cloud & DevOps', skillType: 'technical' },
    { name: 'Docker', category: 'Cloud & DevOps', skillType: 'technical' },
    { name: 'Kubernetes', category: 'Cloud & DevOps', skillType: 'technical' },
    { name: 'Git', category: 'Cloud & DevOps', skillType: 'technical' },

    // Databases
    { name: 'PostgreSQL', category: 'Databases', skillType: 'technical' },
    { name: 'MongoDB', category: 'Databases', skillType: 'technical' },
    { name: 'Redis', category: 'Databases', skillType: 'technical' },

    // Design
    { name: 'Figma', category: 'Design & UX', skillType: 'technical' },

    // === SOFT SKILLS ===
    { name: 'Communication', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Problem Solving', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Team Collaboration', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Leadership', category: 'Soft Skills', skillType: 'soft' },

    // === NICE TO HAVE ===
    { name: 'Agile/Scrum', category: 'Nice to Have', skillType: 'nice_to_have' },
    { name: 'JIRA', category: 'Nice to Have', skillType: 'nice_to_have' },
    { name: 'AWS Certification', category: 'Nice to Have', skillType: 'nice_to_have' }
  ];

  // State Signals
  isLoading = signal(false);
  errorMessage = signal('')
  showPassword = signal(false);

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    country: ['', Validators.required],
    region: ['', Validators.required], // This is now City
    school: ['', Validators.required],
    department: ['', Validators.required],
    bio: [''],
    skills: [[] as string[]]
  });

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.isLoadingCountries.set(true);
    this.geoService.getCountries().subscribe({
      next: (data) => {
        this.countries.set(data);
        this.isLoadingCountries.set(false);
      },
      error: () => {
        this.isLoadingCountries.set(false);
        // Fallback or error handling
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onCountryChange() {
    const country = this.registerForm.get('country')?.value;
    if (country) {
      this.isLoadingCities.set(true);
      this.cities.set([]); // Clear previous
      this.registerForm.patchValue({ region: '' }); // Reset selection

      this.geoService.getCities(country).subscribe({
        next: (data) => {
          this.cities.set(data);
          this.isLoadingCities.set(false);
        },
        error: () => {
          this.isLoadingCities.set(false);
        }
      });
    } else {
      this.cities.set([]);
    }
  }

  onSkillChange(event: any) {
    const skill = event.target.value;
    const currentSkills = this.registerForm.get('skills')?.value as string[];

    if (event.target.checked) {
      this.registerForm.patchValue({ skills: [...currentSkills, skill] });
    } else {
      this.registerForm.patchValue({ skills: currentSkills.filter(s => s !== skill) });
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.registerCandidate(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading.set(false);
          // Auto login or redirect to login
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Registration failed.');
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      this.registerForm.markAllAsTouched();
    }
  }
}
