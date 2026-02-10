import { MatchingStrategy, MatchResult, JobMatch } from './strategies/matching.strategy';
import { GeminiMatchingStrategy } from './strategies/gemini.strategy';
import { QuickMatchingStrategy } from './strategies/quick.strategy';
import { config } from '../config';

export class AIMatchingService {
    private strategy: MatchingStrategy;
    private geminiStrategy: GeminiMatchingStrategy;
    private quickStrategy: QuickMatchingStrategy;

    constructor() {
        this.geminiStrategy = new GeminiMatchingStrategy();
        this.quickStrategy = new QuickMatchingStrategy();

        // Default to Gemini if API key exists, otherwise Quick
        this.strategy = config.geminiApiKey ? this.geminiStrategy : this.quickStrategy;
    }

    async findTopCandidates(jobId: string, forceRefresh: boolean = false): Promise<MatchResult> {
        try {
            return await this.strategy.matchJobToCandidates(jobId, forceRefresh);
        } catch (error) {
            console.error('Matching Error (Primary Strategy Failed):', error);
            // Fallback to quick strategy if primary failed and it wasn't already quick
            if (this.strategy !== this.quickStrategy) {
                console.log('Falling back to Quick Strategy...');
                return await this.quickStrategy.matchJobToCandidates(jobId);
            }
            throw error;
        }
    }

    async findTopJobsForCandidate(candidateId: string): Promise<JobMatch[]> {
        try {
            return await this.strategy.matchCandidateToJobs(candidateId);
        } catch (error) {
            console.error('Job Matching Error (Primary Strategy Failed):', error);
            if (this.strategy !== this.quickStrategy) {
                console.log('Falling back to Quick Strategy...');
                return await this.quickStrategy.matchCandidateToJobs(candidateId);
            }
            return [];
        }
    }

    // Legacy support or specific forceful usage
    async quickMatch(jobId: string): Promise<MatchResult> {
        return this.quickStrategy.matchJobToCandidates(jobId);
    }
}

export const aiMatchingService = new AIMatchingService();
