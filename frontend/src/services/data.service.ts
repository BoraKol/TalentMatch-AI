import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService, Candidate } from './api.service';
export type { Candidate }; // Re-export for consumers
import { firstValueFrom } from 'rxjs';

// Local Candidate interface removed to use imported one

export interface Job {
  id: number;
  title: string;
  type: string;
  department: string;
  description: string;
  primarySkills: string[];
  secondarySkills: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private apiService: ApiService) {
    this.loadCandidates();
  }

  inviteCandidate(candidate: Candidate, jobTitle: string) {
    if (!candidate.id) return Promise.reject('No ID');
    return firstValueFrom(this.apiService.inviteCandidate(candidate.id, jobTitle));
  }

  getAnalytics() {
    return firstValueFrom(this.apiService.getAnalyticsDashboard());
  }

  async loadCandidates() {
    try {
      const data = await firstValueFrom(this.apiService.getCandidates());
      // Map backend structure and assign
      // We map _id to id to ensure compatibility with frontend components and Gemini service
      this.candidates = (data as any[]).map(c => {
        const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Candidate';
        return {
          ...c,
          id: c._id || c.id,
          name: fullName,
          role: c.currentTitle || c.role || 'Job Candidate',
          // Ensure avatar has a fallback if missing from backend
          avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
        };
      });
      console.log('Candidates loaded from API:', data);
    } catch (e) {
      console.error('Failed to load candidates', e);
    }
  }
  // Configurable Algorithm Settings (from the text)
  algorithmSettings = signal({
    primarySkillPoints: 10,
    secondarySkillPoints: 5,
    softSkillPoints: 3,
    niceToHavePoints: 2
  });

  candidates: Candidate[] = [];
  jobs: Job[] = [];

  updateSettings(newSettings: any) {
    this.algorithmSettings.set(newSettings);
  }
}