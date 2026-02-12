import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-job-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <a [routerLink]="dashboardLink()" class="inline-flex items-center text-sm text-slate-600 hover:text-emerald-600 mb-4">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </a>
          <h1 class="text-3xl font-bold text-slate-800">Post a New Job</h1>
          <p class="text-slate-600 mt-2">Create a job listing and find the best candidates with AI</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
            <!-- Basic Info -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">1</span>
                Basic Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                  <input formControlName="title" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. Senior Frontend Developer">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                  <input formControlName="company" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-200 px-4 py-3"
                         placeholder="Your company name">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input formControlName="location" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. Istanbul, Remote">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                  <select formControlName="employmentType"
                          class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Experience Required (years)</label>
                  <input formControlName="experienceRequired" type="number" min="0"
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="0">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                  <input formControlName="salaryRange" type="text" 
                         class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                         placeholder="e.g. 80,000 - 120,000 TL">
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">2</span>
                Job Description
              </h2>
              <textarea formControlName="description" rows="5"
                        class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3"
                        placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."></textarea>
            </div>

            <!-- Primary Skills -->
            <div class="mb-8 p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                Primary Skills (10 Points)
              </h2>
              <p class="text-sm text-slate-600 mb-4">Crucial technical skills. Matches here contribute 10 points to the score.</p>
              <div class="flex flex-wrap gap-2">
                @for (skill of technicalSkills; track skill) {
                  <button type="button" 
                          (click)="toggleSkill(skill, 'primary')"
                          [class]="isSkillSelected(skill, 'primary') 
                            ? 'px-4 py-2 rounded-full bg-emerald-500 text-white font-medium transition-all shadow-md scale-105' 
                            : 'px-4 py-2 rounded-full bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 font-medium transition-all'">
                    {{ skill }}
                  </button>
                }
              </div>
            </div>

            <!-- Secondary Skills -->
            <div class="mb-8 p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                Secondary Skills (5 Points)
              </h2>
              <p class="text-sm text-slate-600 mb-4">Important but not absolute requirements. Matches contribute 5 points.</p>
              <div class="flex flex-wrap gap-2">
                @for (skill of technicalSkills; track skill) {
                  <button type="button" 
                          (click)="toggleSkill(skill, 'secondary')"
                          [class]="isSkillSelected(skill, 'secondary') 
                            ? 'px-4 py-2 rounded-full bg-blue-500 text-white font-medium transition-all shadow-md scale-105' 
                            : 'px-4 py-2 rounded-full bg-white text-slate-600 border border-slate-200 hover:border-blue-300 font-medium transition-all'">
                    {{ skill }}
                  </button>
                }
              </div>
            </div>

            <!-- Soft Skills -->
            <div class="mb-8 p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
              <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                Soft Skills (2 Points)
              </h2>
              <p class="text-sm text-slate-600 mb-4">Interpersonal skills that round out a candidate.</p>
              <div class="flex flex-wrap gap-2">
                @for (skill of softSkillsList; track skill) {
                  <button type="button" 
                          (click)="toggleSkill(skill, 'soft')"
                          [class]="isSkillSelected(skill, 'soft') 
                            ? 'px-4 py-2 rounded-full bg-purple-500 text-white font-medium transition-all shadow-md scale-105' 
                            : 'px-4 py-2 rounded-full bg-white text-slate-600 border border-slate-200 hover:border-purple-300 font-medium transition-all'">
                    {{ skill }}
                  </button>
                }
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <!-- Submit -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button type="submit" 
                      [disabled]="isLoading() || !jobForm.valid"
                      class="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isLoading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Posting Job...
                  </span>
                } @else {
                  Post Job & Find Candidates with Weighted AI
                }
              </button>
              <button type="button" routerLink="/employer/dashboard"
                      class="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class JobPostComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');

  primarySkills = signal<string[]>([]);
  secondarySkills = signal<string[]>([]);
  softSkills = signal<string[]>([]);

  // Dynamic dashboard link based on user role
  dashboardLink = signal('/employer/dashboard');

  technicalSkills: string[] = [];
  softSkillsList: string[] = [];

  private getCompanyName(): string {
    const user = this.authService.currentUser();
    return user?.companyName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  }

  availableSkills = [
    // === TECHNICAL SKILLS ===
    // Software Development
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Next.js', 'Tailwind CSS', 'Sass/SCSS',
    'Node.js', 'Python', 'Java', 'C#', 'Go (Golang)', 'Rust', 'PHP', 'Ruby',
    'Express.js', 'NestJS', 'Django', 'Flask', 'Spring Boot', 'ASP.NET Core', 'Laravel',

    // Mobile Development
    'React Native', 'Flutter', 'Swift', 'SwiftUI', 'Kotlin', 'Dart',

    // Data & AI
    'Pandas', 'NumPy', 'Jupyter', 'R', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'OpenAI API', 'LangChain', 'Apache Spark', 'Airflow', 'dbt',

    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud (GCP)', 'Docker', 'Kubernetes', 'Helm',
    'Jenkins', 'GitHub Actions', 'GitLab CI', 'Terraform', 'Ansible', 'Git',

    // Databases
    'PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB', 'Redis',
    'Elasticsearch', 'DynamoDB', 'Firebase',

    // Networking & Security
    'TCP/IP', 'DNS', 'Load Balancing', 'CDN', 'VPN',
    'Penetration Testing', 'OWASP', 'SIEM', 'IAM', 'Firewall',

    // Design & UX
    'Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping',

    // === SOFT SKILLS ===
    'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management',
    'Adaptability', 'Critical Thinking', 'Leadership', 'Mentoring',

    // === NICE TO HAVE ===
    'Agile/Scrum', 'JIRA', 'Confluence', 'Technical Writing',
    'Open Source Contribution', 'Startup Experience', 'Remote Work Experience',
    'AWS Certification', 'Azure Certification', 'CISSP', 'PMP'
  ];

  constructor() {
    // Separate technical and soft skills for the template
    this.technicalSkills = this.availableSkills.filter(s =>
      !['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Adaptability', 'Critical Thinking', 'Leadership', 'Mentoring'].includes(s)
    );
    this.softSkillsList = this.availableSkills.filter(s =>
      ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Adaptability', 'Critical Thinking', 'Leadership', 'Mentoring'].includes(s)
    );

    // Set dashboard link based on user role
    const role = this.authService.currentUser()?.role;
    if (role === 'institution_admin' || role === 'institution_user') {
      this.dashboardLink.set('/institution/dashboard');
    }

    // Auto-fill company name
    effect(() => {
      const company = this.getCompanyName();
      if (company && this.jobForm) {
        this.jobForm.get('company')?.setValue(company);
      }
    });
  }

  // ... (rest of class)

  jobForm = this.fb.group({
    title: ['', Validators.required],
    company: [{ value: this.getCompanyName(), disabled: true }, Validators.required],
    description: ['', Validators.required],
    location: [''],
    employmentType: ['Full-time'],
    experienceRequired: [0],
    salaryRange: ['']
  });



  toggleSkill(skill: string, type: 'primary' | 'secondary' | 'soft') {
    const categories = {
      primary: this.primarySkills,
      secondary: this.secondarySkills,
      soft: this.softSkills
    };

    const target = categories[type];
    const current = target();

    if (current.includes(skill)) {
      target.set(current.filter(s => s !== skill));
    } else {
      // Remove from other categories first to ensure exclusivity
      [this.primarySkills, this.secondarySkills, this.softSkills].forEach(cat => {
        cat.set(cat().filter(s => s !== skill));
      });

      target.set([...current, skill]);
    }
  }

  isSkillSelected(skill: string, type: 'primary' | 'secondary' | 'soft'): boolean {
    const categories = {
      primary: this.primarySkills,
      secondary: this.secondarySkills,
      soft: this.softSkills
    };
    return categories[type]().includes(skill);
  }

  onSubmit() {
    if (this.jobForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const jobData = {
        ...this.jobForm.getRawValue(),
        primarySkills: this.primarySkills(),
        secondarySkills: this.secondarySkills(),
        softSkills: this.softSkills(),
        requiredSkills: this.primarySkills(), // backwards compatibility
        requirements: this.primarySkills() // backwards compatibility
      };

      this.http.post<any>(`${environment.apiUrl}/jobs`, jobData).subscribe({
        next: (response) => {
          this.router.navigate(['/employer/jobs', response._id, 'matches']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to post job');
        }
      });
    }
  }
}
