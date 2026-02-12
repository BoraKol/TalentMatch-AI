import { MatchingStrategy, MatchResult, JobMatch, CandidateMatch } from './matching.strategy';
import Job from '../../models/job.model';
import Candidate from '../../models/candidate.model';

export class QuickMatchingStrategy implements MatchingStrategy {

    async matchJobToCandidates(jobId: string): Promise<MatchResult> {
        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        const candidates = await Candidate.find({ status: { $ne: 'rejected' } }).lean();

        // Use categorized skills or fall back to legacy requiredSkills as "primary"
        const jPrimary = (job.primarySkills?.length ? job.primarySkills : job.requiredSkills || []).map(s => s.toLowerCase());
        const jSecondary = (job.secondarySkills || []).map(s => s.toLowerCase());
        const jSoft = (job.softSkills || []).map(s => s.toLowerCase());

        const MAX_SCORE = (jPrimary.length * 10) + (jSecondary.length * 5) + (jSoft.length * 2);

        const scoredCandidates = candidates.map(c => {
            const cPrimary = (c.primarySkills?.length ? c.primarySkills : c.skills || []).map(s => s.toLowerCase());
            const cSecondary = (c.secondarySkills || []).map(s => s.toLowerCase());
            const cSoft = (c.softSkills || []).map(s => s.toLowerCase());

            // Helper to check for matches across all candidate skill categories
            const allCSkills = [...cPrimary, ...cSecondary, ...cSoft];
            const checkMatch = (req: string) => allCSkills.some(cs => cs.includes(req) || req.includes(cs));

            const primaryMatches = jPrimary.filter(checkMatch);
            const secondaryMatches = jSecondary.filter(checkMatch);
            const softMatches = jSoft.filter(checkMatch);

            const score = (primaryMatches.length * 10) + (secondaryMatches.length * 5) + (softMatches.length * 2);
            const percentage = MAX_SCORE > 0 ? Math.round((score / MAX_SCORE) * 100) : 0;

            return {
                candidateId: c._id.toString(),
                candidateName: `${c.firstName} ${c.lastName}`,
                email: c.email,
                matchPercentage: percentage,
                scoreBreakdown: {
                    primary: primaryMatches.length * 10,
                    secondary: secondaryMatches.length * 5,
                    soft: softMatches.length * 2,
                    total: score,
                    maxPossible: MAX_SCORE
                },
                analysis: `Matched ${primaryMatches.length} primary, ${secondaryMatches.length} secondary, and ${softMatches.length} soft skills.`,
                strengths: [...primaryMatches, ...secondaryMatches],
                skills: c.skills || [],
                experience: c.experience || 0,
                school: c.school,
                department: c.department,
                bio: c.bio
            };
        });

        return {
            job: { id: job._id.toString(), title: job.title, company: job.company },
            matches: (scoredCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5) as any) as CandidateMatch[],
            analyzedAt: new Date()
        };
    }

    async matchCandidateToJobs(candidateId: string): Promise<JobMatch[]> {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return [];

        const jobs = await Job.find().lean();
        const cSkills = (candidate.skills || []).map(s => s.toLowerCase());

        const scoredJobs = jobs.map(j => {
            const jSkills = (j.requiredSkills || []).map(s => s.toLowerCase());
            const matches = jSkills.filter(req => cSkills.some(cs => cs.includes(req))).length;
            const score = jSkills.length ? Math.round((matches / jSkills.length) * 100) : 0;

            return {
                id: j._id.toString(),
                title: j.title,
                company: j.company,
                matchScore: score,
                aiAnalysis: `Quick Match: ${score}% skill overlap`,
                description: j.description,
                location: j.location,
                type: j.employmentType
            };
        });

        return scoredJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    }
}
