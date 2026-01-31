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

  candidates: Candidate[] = [
    {
      id: 1,
      name: "Elara Vance",
      role: "Senior Frontend Dev",
      email: "elara.vance@example.com",
      avatar: "https://picsum.photos/seed/elara/200/200",
      bio: "Passionate about UI/UX and building accessible web applications. 5 years of experience with Angular and React.",
      skills: ["Angular", "TypeScript", "Tailwind", "Figma", "Accessibility"],
      experience: "5 Years at TechFlow Inc."
    },
    {
      id: 2,
      name: "Marcus Chen",
      role: "Full Stack Engineer",
      email: "marcus.chen@example.com",
      avatar: "https://picsum.photos/seed/marcus/200/200",
      bio: "Full stack wizard who loves optimizing backend queries as much as pixel-perfect CSS. Expert in Node.js and Cloud architecture.",
      skills: ["Node.js", "React", "AWS", "PostgreSQL", "Docker"],
      experience: "4 Years at CloudSystems"
    },
    {
      id: 3,
      name: "Sarah Jenkins",
      role: "Product Designer",
      avatar: "https://picsum.photos/seed/sarah/200/200",
      bio: "Creative designer with a knack for user-centered design principles. I bridge the gap between design and code.",
      skills: ["Figma", "Adobe XD", "CSS", "HTML", "User Research"],
      experience: "3 Years at Designify"
    },
    {
      id: 4,
      name: "David Ross",
      role: "Backend Specialist",
      avatar: "https://picsum.photos/seed/david/200/200",
      bio: "Deep knowledge of distributed systems and microservices. I build scalable APIs.",
      skills: ["Java", "Spring Boot", "Kubernetes", "Kafka", "System Design"],
      experience: "6 Years at Enterprise Corp"
    },
    {
      id: 5,
      name: "Priya Patel",
      role: "Frontend Developer",
      avatar: "https://picsum.photos/seed/priya/200/200",
      bio: "Frontend enthusiast focused on performance and animations. Love working with modern JS frameworks.",
      skills: ["Vue.js", "JavaScript", "GSAP", "Sass"],
      experience: "2 Years at WebWiz"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "DevOps Engineer",
      avatar: "https://picsum.photos/seed/james/200/200",
      bio: "Automating everything. CI/CD pipelines are my playground.",
      skills: ["Terraform", "Ansible", "AWS", "Python", "Bash"],
      experience: "4 Years at OpsMaster"
    }
  ];

  jobs: Job[] = [
    {
      id: 101,
      title: "Senior Frontend Engineer",
      type: "Full Time",
      department: "Engineering",
      description: "We are looking for a Senior Frontend Engineer to lead our dashboard team. You must have deep expertise in Angular and a good eye for design.",
      primarySkills: ["Angular", "TypeScript"],
      secondarySkills: ["Tailwind", "Figma"]
    },
    {
      id: 102,
      title: "Backend API Developer",
      type: "Contract",
      department: "Platform",
      description: "Join our platform team to build high-performance APIs. Experience with Node.js and cloud infrastructure is a must.",
      primarySkills: ["Node.js", "AWS"],
      secondarySkills: ["PostgreSQL", "Docker"]
    },
    {
      id: 103,
      title: "UX/UI Designer",
      type: "Part Time",
      department: "Product",
      description: "Help us redesign our mobile application. We need someone who understands user flows and can prototype quickly.",
      primarySkills: ["Figma", "User Research"],
      secondarySkills: ["CSS", "Prototyping"]
    }
  ];

  updateSettings(newSettings: any) {
    this.algorithmSettings.set(newSettings);
  }
}