import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface CandidateProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: number;
  education?: {
    degree?: string;
    field?: string;
    institution?: string;
    graduationYear?: number;
  };
  school?: string;
  department?: string;
  gpa?: number;
  bio?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Button -->
        <button (click)="goBack()" class="inline-flex items-center text-sm text-slate-300 hover:text-white mb-6 transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Results
        </button>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-slate-400">Loading profile...</p>
          </div>
        }

        @if (error()) {
          <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <p class="text-red-400">{{ error() }}</p>
            <button (click)="goBack()" class="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
              Go Back
            </button>
          </div>
        }

        @if (candidate()) {
          <!-- Profile Header -->
          <div class="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 overflow-hidden mb-6">
            <div class="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"></div>
            <div class="px-8 pb-8">
              <div class="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
                <div class="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-slate-800">
                  {{ getInitials(candidate()!.firstName, candidate()!.lastName) }}
                </div>
                <div class="flex-1 pt-4 sm:pt-0">
                  <h1 class="text-3xl font-bold text-white">{{ candidate()!.firstName }} {{ candidate()!.lastName }}</h1>
                  <p class="text-slate-400 mt-1">{{ candidate()!.email }}</p>
                  @if (candidate()!.phone) {
                    <p class="text-slate-500 text-sm">{{ candidate()!.phone }}</p>
                  }
                </div>
                <div class="flex gap-3">
                  @if (candidate()!.linkedIn) {
                    <a [href]="candidate()!.linkedIn" target="_blank" class="p-3 bg-slate-700 hover:bg-blue-600 rounded-xl transition-colors group">
                      <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  }
                  @if (candidate()!.github) {
                    <a [href]="candidate()!.github" target="_blank" class="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors group">
                      <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  }
                  @if (candidate()!.portfolio) {
                    <a [href]="candidate()!.portfolio" target="_blank" class="p-3 bg-slate-700 hover:bg-emerald-600 rounded-xl transition-colors group">
                      <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                      </svg>
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 text-center">
              <div class="w-12 h-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-white">{{ candidate()!.experience || 0 }}</p>
              <p class="text-xs text-slate-500 uppercase tracking-wider">Years Exp</p>
            </div>
            <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 text-center">
              <div class="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-white">{{ candidate()!.skills?.length || 0 }}</p>
              <p class="text-xs text-slate-500 uppercase tracking-wider">Skills</p>
            </div>
            <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 text-center">
              <div class="w-12 h-12 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-white">{{ candidate()!.gpa || 'N/A' }}</p>
              <p class="text-xs text-slate-500 uppercase tracking-wider">GPA</p>
            </div>
            <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-4 text-center">
              <div class="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                   [class]="getStatusBgColor(candidate()!.status)">
                <svg class="w-6 h-6" [class]="getStatusIconColor(candidate()!.status)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-lg font-bold text-white capitalize">{{ candidate()!.status }}</p>
              <p class="text-xs text-slate-500 uppercase tracking-wider">Status</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Left Column - Skills & Education -->
            <div class="md:col-span-2 space-y-6">
              <!-- Skills Section -->
              <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  Skills & Technologies
                </h3>
                <div class="flex flex-wrap gap-2">
                  @for (skill of candidate()!.skills; track skill) {
                    <span class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 font-medium border border-purple-500/30">
                      {{ skill }}
                    </span>
                  }
                  @if (!candidate()!.skills?.length) {
                    <p class="text-slate-500">No skills listed</p>
                  }
                </div>
              </div>

              <!-- Education Section -->
              <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  </svg>
                  Education
                </h3>
                @if (candidate()!.school || candidate()!.education?.institution) {
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-white font-semibold">{{ candidate()!.school || candidate()!.education?.institution }}</p>
                      @if (candidate()!.department || candidate()!.education?.field) {
                        <p class="text-slate-400">{{ candidate()!.department || candidate()!.education?.field }}</p>
                      }
                      @if (candidate()!.education?.degree) {
                        <p class="text-slate-500 text-sm">{{ candidate()!.education?.degree }}</p>
                      }
                      @if (candidate()!.education?.graduationYear) {
                        <p class="text-slate-500 text-sm">Class of {{ candidate()!.education?.graduationYear }}</p>
                      }
                    </div>
                  </div>
                } @else {
                  <p class="text-slate-500">No education information available</p>
                }
              </div>

              <!-- Bio Section -->
              @if (candidate()!.bio) {
                <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                  <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    About
                  </h3>
                  <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">{{ candidate()!.bio }}</p>
                </div>
              }
            </div>

            <!-- Right Column - Quick Actions -->
            <div class="space-y-6">
              <!-- Contact Card -->
              <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div class="space-y-3">
                  <button (click)="openContactModal()" class="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Send Email
                  </button>
                  @if (candidate()!.resumeUrl) {
                    <a [href]="candidate()!.resumeUrl" target="_blank" class="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Download Resume
                    </a>
                  }
                  @if (candidate()!.phone) {
                    <a [href]="'tel:' + candidate()!.phone" class="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      Call Candidate
                    </a>
                  }
                </div>
              </div>

              <!-- Member Since -->
              <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Member Since</p>
                <p class="text-white font-medium">{{ formatDate(candidate()!.createdAt) }}</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Contact Modal -->
    @if (showContactModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="closeContactModal()">
        <div class="relative bg-slate-800 rounded-3xl border border-slate-700 w-full max-w-lg shadow-2xl" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Contact Candidate</h3>
                  <p class="text-sm text-slate-400">Send a message to {{ candidate()?.firstName }} {{ candidate()?.lastName }}</p>
                </div>
              </div>
              <button (click)="closeContactModal()" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <input type="text" [(ngModel)]="contactSubject" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                     placeholder="Enter email subject...">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea [(ngModel)]="contactMessage" rows="5"
                        class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                        placeholder="Write your message to the candidate..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                <input type="text" [(ngModel)]="senderName" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                       placeholder="John Doe">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
                <input type="email" [(ngModel)]="senderEmail" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                       placeholder="john@company.com">
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-slate-700 flex gap-3">
            <button (click)="closeContactModal()" 
                    class="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">
              Cancel
            </button>
            <button (click)="sendContactEmail()" 
                    [disabled]="isSendingEmail()"
                    class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (isSendingEmail()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Send Email
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Success Toast -->
    @if (showSuccessToast()) {
      <div class="fixed bottom-6 right-6 z-50 animate-slide-up">
        <div class="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="font-medium">Email sent successfully!</span>
        </div>
      </div>
    }
  `
})
export class CandidateProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoading = signal(true);
  error = signal('');
  candidate = signal<CandidateProfile | null>(null);

  // Modal State
  showContactModal = signal(false);
  isSendingEmail = signal(false);
  showSuccessToast = signal(false);

  // Form Fields
  contactSubject = '';
  contactMessage = '';
  senderName = '';
  senderEmail = '';

  ngOnInit() {
    const candidateId = this.route.snapshot.paramMap.get('candidateId');
    if (candidateId) {
      this.loadCandidate(candidateId);
    } else {
      this.error.set('No candidate ID provided');
      this.isLoading.set(false);
    }
  }

  loadCandidate(candidateId: string) {
    this.http.get<CandidateProfile>(`${environment.apiUrl}/candidates/${candidateId}`).subscribe({
      next: (data) => {
        this.candidate.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to load candidate profile');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    window.history.back();
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  getStatusBgColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-500/20';
      case 'hired': return 'bg-blue-500/20';
      case 'rejected': return 'bg-red-500/20';
      default: return 'bg-slate-500/20';
    }
  }

  getStatusIconColor(status: string): string {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'hired': return 'text-blue-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-slate-400';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Contact Modal Methods
  openContactModal() {
    const c = this.candidate();
    if (!c) return;

    this.contactSubject = `Opportunity at our company`;
    this.contactMessage = `Hi ${c.firstName},\n\nI was impressed by your profile on TalentMatch AI.\n\nWe have an exciting opportunity that I believe would be a great fit for your experience.\n\nWould you be interested in learning more about this role?\n\nBest regards`;

    // Auto-fill sender info from logged-in user
    const user = this.authService.currentUser();
    if (user) {
      this.senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Hiring Manager';
      this.senderEmail = user.email || '';
    }

    this.showContactModal.set(true);
  }

  closeContactModal() {
    this.showContactModal.set(false);
  }

  sendContactEmail() {
    const c = this.candidate();
    if (!c || !this.contactSubject || !this.contactMessage || !this.senderName || !this.senderEmail) {
      return;
    }

    this.isSendingEmail.set(true);

    const payload = {
      candidateId: c._id,
      // jobId might be null here if we are just browsing candidates generally
      // The backend should handle optional jobId gracefully, or we can look it up from query params if available
      subject: this.contactSubject,
      message: this.contactMessage,
      senderName: this.senderName,
      senderEmail: this.senderEmail,
      companyName: 'Company' // We might need to fetch this from user profile if not available in job context
    };

    this.http.post(`${environment.apiUrl}/contact/candidate`, payload).subscribe({
      next: (response: any) => {
        this.isSendingEmail.set(false);
        this.closeContactModal();
        this.showSuccessToast.set(true);
        setTimeout(() => {
          this.showSuccessToast.set(false);
        }, 3000);
      },
      error: (err) => {
        this.isSendingEmail.set(false);
        console.error('Failed to send email:', err);
        alert('Failed to send email. Please try again.');
      }
    });
  }
}
