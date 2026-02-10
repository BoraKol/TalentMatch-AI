import { MatchingStrategy, MatchResult, JobMatch, CandidateMatch } from './matching.strategy';
import Job from '../../models/job.model';
import Candidate from '../../models/candidate.model';

export class QuickMatchingStrategy implements MatchingStrategy {

    async matchJobToCandidates(jobId: string): Promise<MatchResult> {
        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        const candidates = await Candidate.find({ status: { $ne: 'rejected' } }).lean();
        const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

        const scoredCandidates = candidates.map(c => {
            const cSkills = (c.skills || []).map(s => s.toLowerCase());
            const matches = requiredSkills.filter(req => cSkills.some(cs => cs.includes(req) || req.includes(cs)));
            const score = requiredSkills.length ? Math.round((matches.length / requiredSkills.length) * 100) : 0;

            return {
                candidateId: c._id.toString(),
                candidateName: `${c.firstName} ${c.lastName}`,
                email: c.email,
                matchPercentage: score,
                analysis: `Matched ${matches.length}/${requiredSkills.length} skills`,
                strengths: matches,
                skills: c.skills || [],
                experience: c.experience || 0,
                school: c.school,
                department: c.department,
                bio: c.bio
            };
        });

        return {
            job: { id: job._id.toString(), title: job.title, company: job.company },
            matches: scoredCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3) as CandidateMatch[],
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
