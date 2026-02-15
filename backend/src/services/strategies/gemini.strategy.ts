import { MatchingStrategy, MatchResult, JobMatch, CandidateMatch } from './matching.strategy';
import { GoogleGenAI } from '@google/genai';
import { candidateRepository } from '../../repositories/candidate.repository';
import { jobRepository } from '../../repositories/job.repository';
import AppSetting from '../../models/app-setting.model';
import { config } from '../../config';
import logger from '../../utils/logger';

export class GeminiMatchingStrategy implements MatchingStrategy {
    private client: GoogleGenAI | null = null;
    private cache: Map<string, { result: MatchResult; timestamp: number }> = new Map();
    private CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache
    private MAX_CACHE_SIZE = 100; // Prevent unbounded memory growth

    constructor() {
        if (config.geminiApiKey) {
            this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
        }
    }

    /** Evicts expired entries and enforces size limit (LRU-style) */
    private evictCache(): void {
        const now = Date.now();
        // Remove expired entries
        for (const [key, value] of this.cache) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
        // If still over limit, remove oldest entries
        while (this.cache.size > this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
    }

    async matchJobToCandidates(jobId: string, forceRefresh: boolean = false): Promise<MatchResult> {
        // Cache Check
        if (!forceRefresh) {
            const cached = this.cache.get(jobId);
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
                return cached.result;
            }
        }

        const job = await jobRepository.findOne(jobId);
        if (!job) throw new Error('Job not found');

        // Fetch limited candidates + settings via repository
        const candidates = await candidateRepository.find({ status: { $ne: 'rejected' } });

        if (candidates.length === 0) {
            return { job: { id: job._id.toString(), title: job.title, company: job.company }, matches: [], analyzedAt: new Date() };
        }

        const settings = await this.getAlgorithmSettings();
        const prompt = this.buildJobMatchPrompt(job, candidates, settings);

        try {
            const aiMatches = await this.callGemini(prompt);
            const matches = this.enrichCandidateMatches(aiMatches, candidates);

            const result = {
                job: { id: job._id.toString(), title: job.title, company: job.company },
                matches: matches.slice(0, 3),
                analyzedAt: new Date()
            };

            this.evictCache();
            this.cache.set(jobId, { result, timestamp: Date.now() });
            return result;
        } catch (error) {
            logger.error('Gemini Match Error', { error });
            throw error;
        }
    }

    async matchCandidateToJobs(candidateId: string): Promise<JobMatch[]> {
        const candidate = await candidateRepository.findOne(candidateId);
        if (!candidate) return [];

        const jobs = await jobRepository.find({});
        if (jobs.length === 0) return [];

        const settings = await this.getAlgorithmSettings();
        const prompt = this.buildCandidateMatchPrompt(candidate, jobs, settings);

        try {
            const aiMatches = await this.callGemini(prompt);
            return this.enrichJobMatches(aiMatches, jobs).slice(0, 3);
        } catch (error) {
            logger.error('Gemini Candidate Match Error', { error });
            throw error;
        }
    }

    private async callGemini(prompt: string): Promise<any[]> {
        if (!this.client) throw new Error('Gemini API not configured');

        const response = await this.client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0,
                topP: 1,
                topK: 1,
                maxOutputTokens: 2048
            }
        });

        const text = response.text;
        if (!text) return [];
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    private async getAlgorithmSettings(): Promise<any> {
        try {
            const settings = await AppSetting.find({ key: { $regex: 'Algorithm.*' } });
            return settings.reduce((acc: any, curr: any) => {
                acc[curr.value.slug] = curr.value.fieldValue;
                return acc;
            }, {});
        } catch {
            return {};
        }
    }

    private buildJobMatchPrompt(job: any, candidates: any[], settings: any): string {
        return `
            You are an AI Talent Matcher.
            Priorities: Skill=${settings['primary_skills'] || 10}, Exp=${settings['secondary_skills'] || 5}.
            
            JOB: ${job.title} at ${job.company}
            Reqs: ${(job.requiredSkills || []).join(', ')}
            
            CANDIDATES (${candidates.length}):
            ${JSON.stringify(candidates.map(c => ({
            id: c._id,
            name: `${c.firstName} ${c.lastName}`,
            skills: c.skills,
            exp: c.experience,
            bio: c.bio
        })), null, 2)}
            
            Find TOP 3 matches. OUTPUT JSON array: [{ candidateId, matchPercentage, analysis, strengths }]
         `;
    }

    private buildCandidateMatchPrompt(candidate: any, jobs: any[], settings: any): string {
        return `
            You are an AI Career Coach.
            Priorities: Skill=${settings['primary_skills'] || 10}, Exp=${settings['secondary_skills'] || 5}.
            
            CANDIDATE: ${candidate.firstName}
            Skills: ${(candidate.skills || []).join(', ')}
            
            JOBS (${jobs.length}):
            ${JSON.stringify(jobs.map(j => ({
            id: j._id,
            title: j.title,
            company: j.company,
            skills: j.requiredSkills
        })), null, 2)}
            
            Find TOP 3 matches. OUTPUT JSON array: [{ jobId, matchScore, reason }]
        `;
    }

    private enrichCandidateMatches(aiMatches: any[], candidates: any[]): CandidateMatch[] {
        return aiMatches.map(m => {
            const c = candidates.find(cand => cand._id.toString() === m.candidateId);
            if (!c) return null;
            return {
                candidateId: c._id.toString(),
                candidateName: `${c.firstName} ${c.lastName}`,
                email: c.email,
                matchPercentage: m.matchPercentage,
                analysis: m.analysis,
                strengths: m.strengths || [],
                skills: c.skills || [],
                experience: c.experience || 0,
                school: c.school,
                department: c.department,
                bio: c.bio
            };
        }).filter(Boolean) as CandidateMatch[];
    }

    private enrichJobMatches(aiMatches: any[], jobs: any[]): JobMatch[] {
        return aiMatches.map(m => {
            const j = jobs.find(job => job._id.toString() === m.jobId);
            if (!j) return null;
            return {
                id: j._id.toString(),
                title: j.title,
                company: j.company,
                matchScore: m.matchScore,
                aiAnalysis: m.reason,
                description: j.description,
                location: j.location,
                type: j.employmentType
            };
        }).filter(Boolean) as JobMatch[];
    }
}

