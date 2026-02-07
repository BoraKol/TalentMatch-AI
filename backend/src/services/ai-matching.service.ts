import { GoogleGenerativeAI } from '@google/generative-ai';
import Job, { IJob } from '../models/job.model';
import Candidate, { ICandidate } from '../models/candidate.model';
import { config } from '../config';

interface CandidateMatch {
    candidateId: string;
    candidateName: string;
    email: string;
    matchPercentage: number;
    analysis: string;
    strengths: string[];
    skills: string[];
    experience: number;
    school?: string;
    department?: string;
    bio?: string;
}

interface MatchResult {
    job: {
        id: string;
        title: string;
        company: string;
    };
    matches: CandidateMatch[];
    analyzedAt: Date;
}

export class AIMatchingService {
    private genAI: GoogleGenerativeAI | null = null;
    private cache: Map<string, { result: MatchResult; timestamp: number }> = new Map();
    private CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

    constructor() {
        const apiKey = config.geminiApiKey;
        if (apiKey && apiKey.length > 0) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            console.log('✅ AI Matching Service: Gemini API initialized');
        } else {
            console.warn('⚠️ AI Matching Service: GEMINI_API_KEY not found in config');
        }
    }

    async findTopCandidates(jobId: string, forceRefresh: boolean = false): Promise<MatchResult> {
        console.log(`🔍 AI Matching: Starting analysis for jobId: ${jobId}`);

        // Check cache first (unless force refresh is requested)
        if (!forceRefresh) {
            const cached = this.cache.get(jobId);
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
                console.log('📦 AI Matching: Returning cached result');
                return cached.result;
            }
        }
        // 1. Fetch job details
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }

        // 2. Fetch all active candidates
        const candidates = await Candidate.find({ status: { $ne: 'rejected' } }).lean();

        if (candidates.length === 0) {
            return {
                job: { id: job._id.toString(), title: job.title, company: job.company },
                matches: [],
                analyzedAt: new Date()
            };
        }

        // 3. Prepare data for AI
        const candidatesForAI = candidates.map(c => ({
            id: c._id.toString(),
            name: `${c.firstName} ${c.lastName}`,
            skills: c.skills || [],
            experience: c.experience || 0,
            school: c.school,
            department: c.department,
            currentTitle: c.currentTitle,
            country: c.country,
            region: c.region,
            bio: c.bio
        }));

        // 4. Fetch Algorithm Settings
        const AppSetting = require('../models/app-setting.model').default;
        const settings = await AppSetting.find({ key: { $regex: 'Algorithm.*' } });

        let algorithmContext = "Prioritize matches based on standard recruiting practices.";
        if (settings.length > 0) {
            const settingMap = settings.reduce((acc: any, curr: any) => {
                acc[curr.value.slug] = curr.value.fieldValue;
                return acc;
            }, {});

            algorithmContext = `
                PRIORITIZATION RULES (0-10 Scale, 10 is highest):
                - Skill Match Weight: ${settingMap['primary_skills'] || 10}/10
                - Experience Weight: ${settingMap['secondary_skills'] || 5}/10 (labeled as Secondary/Experience in admin)
                - Soft Skills Weight: ${settingMap['soft_skills'] || 3}/10
                - "Nice to Have" Weight: ${settingMap['nice_to_have'] || 2}/10

                Use these weights to calculate the final match percentage.
                `;
        }

        const prompt = `
You are an expert HR Recruiter and AI Talent Matcher.
The User (Super Admin) has defined the following logic for ranking:
${algorithmContext}

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Required Skills: ${(job.requiredSkills || job.requirements || []).join(', ')}
- Preferred Skills: ${(job.preferredSkills || []).join(', ')}
- Employment Type: ${job.employmentType || 'Full-time'}
- Experience Required: ${job.experienceRequired || 0} years
- Location: ${job.location || 'Remote'}

CANDIDATE POOL (${candidatesForAI.length} candidates):
${JSON.stringify(candidatesForAI, null, 2)}

TASK:
Analyze ALL candidates and find the **TOP 3 BEST** matches for this job.
Strictly adhere to the PRIORITIZATION RULES defined above.

OUTPUT FORMAT (strict JSON):
[
  {
    "candidateId": "exact_mongodb_id_from_pool",
    "matchPercentage": 85,
    "analysis": "2-3 sentence explanation of why this candidate is a good match, citing specific skills and experience.",
    "strengths": ["skill1", "skill2", "skill3"]
  }
]

IMPORTANT:
- candidateId MUST be an exact ID from the candidate pool above
- matchPercentage should be 0-100 based on realistic evaluation
- analysis MUST be detailed and specific
- strengths should list matching skills
- Return ONLY valid JSON, no markdown or extra text
`;

        try {
            if (!this.genAI) {
                throw new Error('Gemini API not initialized. Check GEMINI_API_KEY in .env');
            }

            console.log('🤖 AI Matching: Calling Gemini API...');
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 0,     // No randomness
                    topP: 1,            // Consider only the most probable token
                    topK: 1,            // Select from top 1 token only
                    maxOutputTokens: 2048
                }
            });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            console.log('✅ AI Matching: Received response from Gemini');

            // Parse JSON from response
            let aiMatches: any[] = [];
            try {
                // Try to extract JSON from response
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    aiMatches = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
                aiMatches = [];
            }

            // 5. Enrich results with full candidate data AND Strict Slice to Top 3
            const enrichedMatches: CandidateMatch[] = aiMatches.map((match: any) => {
                const candidate = candidates.find(c => c._id.toString() === match.candidateId);
                if (!candidate) return null;

                return {
                    candidateId: match.candidateId,
                    candidateName: `${candidate.firstName} ${candidate.lastName}`,
                    email: candidate.email,
                    matchPercentage: match.matchPercentage || 0,
                    analysis: match.analysis || 'Analysis not available',
                    strengths: match.strengths || [],
                    skills: candidate.skills || [],
                    experience: candidate.experience || 0,
                    school: candidate.school,
                    department: candidate.department,
                    bio: candidate.bio || ''
                };
            }).filter(Boolean) as CandidateMatch[];

            // Strict limitation to top 3
            const top3Matches = enrichedMatches.slice(0, 3);

            const matchResult: MatchResult = {
                job: { id: job._id.toString(), title: job.title, company: job.company },
                matches: top3Matches,
                analyzedAt: new Date()
            };

            // Store in cache for consistent results
            this.cache.set(jobId, { result: matchResult, timestamp: Date.now() });
            console.log('💾 AI Matching: Result cached');

            return matchResult;

        } catch (error) {
            console.error('AI Matching Error:', error);
            throw new Error('Failed to analyze candidates with AI');
        }
    }

    async findTopJobsForCandidate(candidateId: string): Promise<any> {
        console.log(`🔍 AI Matching: Finding top jobs for candidate: ${candidateId}`);

        try {
            const candidate = await Candidate.findById(candidateId);
            if (!candidate) {
                console.warn(`⚠️ AI Matching: Candidate not found (ID: ${candidateId})`);
                return []; // Return empty instead of throwing to avoid 500 crash if ID is weird
            }

            const jobs = await Job.find().lean();
            if (jobs.length === 0) return [];

            // Prepare data for AI
            const jobsForAI = jobs.map(j => ({
                id: j._id.toString(),
                title: j.title,
                company: j.company,
                description: j.description,
                requiredSkills: j.requiredSkills || [],
                location: j.location,
                type: j.employmentType
            }));

            // Fetch settings for Job matching too
            const AppSetting = require('../models/app-setting.model').default;
            let algorithmContext = "";

            try {
                const settings = await AppSetting.find({ key: { $regex: 'Algorithm.*' } });
                if (settings && settings.length > 0) {
                    const settingMap = settings.reduce((acc: any, curr: any) => {
                        acc[curr.value.slug] = curr.value.fieldValue;
                        return acc;
                    }, {});
                    algorithmContext = `
                    PRIORITIZATION RULES (0-10 Scale):
                    - Skill Match: ${settingMap['primary_skills'] || 10}/10
                    - Experience/Secondary: ${settingMap['secondary_skills'] || 5}/10
                    `;
                }
            } catch (settingsError) {
                console.warn('⚠️ AI Matching: Failed to load algorithm settings, using defaults.', settingsError);
            }

            const prompt = `
You are an expert Career Coach and AI Job Matcher.
The Admin has set the following priorities:
${algorithmContext}

CANDIDATE:
- Name: ${candidate.firstName} ${candidate.lastName}
- Skills: ${(candidate.skills || []).join(', ')}
- Experience: ${candidate.experience} years
- Bio: ${candidate.bio || 'Not provided'}
- Title: ${candidate.currentTitle || 'Not provided'}

AVAILABLE JOBS (${jobsForAI.length}):
${JSON.stringify(jobsForAI, null, 2)}

TASK:
Identify the **TOP 3 BEST** job opportunities for this candidate.
Return JSON array with EXACTLY 3 jobs.

OUTPUT FORMAT (strict JSON):
[
  {
    "jobId": "exact_mongodb_id",
    "matchScore": 90,
    "reason": "Why this is a good fit..."
  }
]
`;

            try {
                if (!this.genAI) throw new Error('Gemini API not initialized');

                const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                let aiMatches: any[] = [];
                try {
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (jsonMatch) aiMatches = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('Failed to parse AI response', e);
                    // Fallback to quick match if AI response is garbage
                    throw new Error('Invalid AI Response');
                }

                if (!Array.isArray(aiMatches) || aiMatches.length === 0) {
                    throw new Error('Empty AI Response');
                }

                // Enrich
                const enriched = aiMatches.map(match => {
                    const job = jobs.find(j => j._id.toString() === match.jobId);
                    if (!job) return null;
                    return {
                        ...job,
                        matchScore: match.matchScore,
                        aiAnalysis: match.reason
                    };
                }).filter(Boolean).slice(0, 3);

                return enriched;

            } catch (aiError) {
                console.error('AI Job Matching Failed (Gemini), falling back to Quick Match:', aiError);
                return this.quickJobMatch(candidate, jobs);
            }

        } catch (fatalError: any) {
            console.error('🔥 AI Matching FATAL Error:', fatalError);
            // Even in fatal error, try to return empty array or fallback if possible, but at least don't crash 500
            return [];
        }
    }

    private quickJobMatch(candidate: any, jobs: any[]): any[] {
        const cSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());

        return jobs.map(job => {
            const jSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
            const matchCount = jSkills.filter((s: string) => cSkills.some((cs: string) => cs.includes(s))).length;
            const score = jSkills.length ? Math.round((matchCount / jSkills.length) * 100) : 0;
            return { ...job, matchScore: score };
        })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);
    }

    // Quick match without AI - basic skill matching
    async quickMatch(jobId: string): Promise<MatchResult> {
        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        const candidates = await Candidate.find({ status: { $ne: 'rejected' } }).lean();
        const requiredSkills = (job.requiredSkills || job.requirements || []).map(s => s.toLowerCase());

        // Calculate match scores
        const scoredCandidates = candidates.map(c => {
            const candidateSkills = (c.skills || []).map((s: string) => s.toLowerCase());
            const matchedSkills = requiredSkills.filter(skill =>
                candidateSkills.some((cs: string) => cs.includes(skill) || skill.includes(cs))
            );
            const matchPercentage = requiredSkills.length > 0
                ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
                : 0;

            return {
                candidateId: c._id.toString(),
                candidateName: `${c.firstName} ${c.lastName}`,
                email: c.email,
                matchPercentage,
                analysis: `Matches ${matchedSkills.length} of ${requiredSkills.length} required skills.`,
                strengths: matchedSkills,
                skills: c.skills || [],
                experience: c.experience || 0,
                school: c.school,
                department: c.department,
                bio: c.bio || ''
            };
        });

        // Sort by match percentage and take top 3
        const topMatches = scoredCandidates
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .slice(0, 3);

        return {
            job: { id: job._id.toString(), title: job.title, company: job.company },
            matches: topMatches,
            analyzedAt: new Date()
        };
    }
}

export const aiMatchingService = new AIMatchingService();
