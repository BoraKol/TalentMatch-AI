export interface CandidateMatch {
    candidateId: string;
    candidateName: string;
    email: string;
    matchPercentage: number;
    scoreBreakdown?: {
        primary: number;
        secondary: number;
        soft: number;
    };
    analysis: string;
    strengths: string[];
    skills: string[];
    experience: number;
    school?: string;
    department?: string;
    bio?: string;
}

export interface JobMatch {
    id: string;
    title: string;
    company: string;
    matchScore: number;
    scoreBreakdown?: {
        primary: number;
        secondary: number;
        soft: number;
    };
    aiAnalysis?: string;
    description?: string;
    location?: string;
    type?: string;
    isReferred?: boolean;
    referralStatus?: string | null;
}

export interface MatchResult {
    job: {
        id: string;
        title: string;
        company: string;
    };
    matches: CandidateMatch[];
    analyzedAt: Date;
}

export interface MatchingStrategy {
    matchJobToCandidates(jobId: string, forceRefresh?: boolean): Promise<MatchResult>;
    matchCandidateToJobs(candidateId: string): Promise<JobMatch[]>;
}
