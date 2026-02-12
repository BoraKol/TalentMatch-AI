
import Job from '../models/job.model';
import Candidate from '../models/candidate.model';
import Application from '../models/application.model';
import SavedJob from '../models/saved-job.model';
import AppSetting from '../models/app-setting.model';

export class JobDiscoveryService {

    async discoverJobs(userId: string, queryParams: any) {
        // Find candidate profile
        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) {
            throw new Error('Candidate profile not found. Please complete your profile first.');
        }

        // Query params
        const page = parseInt(queryParams.page as string) || 1;
        const limit = parseInt(queryParams.limit as string) || 12;
        const locationFilter = queryParams.location as string;
        const typeFilter = queryParams.type as string;
        const minScore = parseInt(queryParams.minScore as string) || 0;

        // Build job query
        const jobQuery: any = { isActive: true };
        if (locationFilter) jobQuery.location = { $regex: locationFilter, $options: 'i' };
        if (typeFilter) jobQuery.employmentType = typeFilter;

        // Fetch jobs, applications, and saved jobs in parallel
        const [jobs, applications, savedJobs] = await Promise.all([
            Job.find(jobQuery).sort({ createdAt: -1 }).lean(),
            Application.find({ candidate: candidate._id }).select('job').lean(),
            SavedJob.find({ candidate: candidate._id }).select('job').lean()
        ]);

        const appliedJobIds = new Set(applications.map(a => a.job.toString()));
        const savedJobIds = new Set(savedJobs.map(s => s.job.toString()));

        // Score each job against candidate skills
        const candidateSkills = new Set((candidate.skills || []).map((s: string) => s.toLowerCase()));
        const candidateTitle = (candidate.currentTitle || '').toLowerCase();

        const scoredJobs = jobs.map(job => {
            const requiredSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
            const preferredSkills = (job.preferredSkills || []).map((s: string) => s.toLowerCase());
            const allJobSkills = [...requiredSkills, ...preferredSkills];

            // Calculate match score
            const matchedRequired = requiredSkills.filter((s: string) => candidateSkills.has(s));
            const matchedPreferred = preferredSkills.filter((s: string) => candidateSkills.has(s));

            const requiredWeight = 0.7;
            const preferredWeight = 0.3;

            const requiredScore = requiredSkills.length > 0
                ? (matchedRequired.length / requiredSkills.length) * 100 * requiredWeight
                : 50 * requiredWeight; // neutral if no required skills specified

            const preferredScore = preferredSkills.length > 0
                ? (matchedPreferred.length / preferredSkills.length) * 100 * preferredWeight
                : 50 * preferredWeight;

            const matchScore = Math.round(requiredScore + preferredScore);

            // Experience bonus/penalty
            const expDiff = (candidate.experience || 0) - (job.experienceRequired || 0);
            const expBonus = expDiff >= 0 ? Math.min(expDiff * 2, 10) : Math.max(expDiff * 5, -20);
            const finalScore = Math.max(0, Math.min(100, matchScore + expBonus));

            // Hidden Gem detection: high skill match but different job title
            const jobTitleLower = job.title.toLowerCase();
            const isTitleMismatch = !jobTitleLower.includes(candidateTitle) && !candidateTitle.includes(jobTitleLower);
            const isHiddenGem = finalScore >= 65 && isTitleMismatch && candidateTitle !== 'open to work';

            // Missing skills
            const missingSkills = allJobSkills.filter((s: string) => !candidateSkills.has(s));

            return {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location || 'Remote',
                employmentType: job.employmentType,
                salaryRange: job.salaryRange,
                experienceRequired: job.experienceRequired,
                requiredSkills: job.requiredSkills,
                preferredSkills: job.preferredSkills,
                description: job.description,
                matchScore: finalScore,
                isHiddenGem,
                isApplied: appliedJobIds.has(job._id.toString()),
                isSaved: savedJobIds.has(job._id.toString()),
                matchedSkills: [...matchedRequired, ...matchedPreferred],
                missingSkills: missingSkills.slice(0, 5),
                postedAt: job.createdAt
            };
        });

        // Filter by minimum score
        const filtered = scoredJobs
            .filter(j => j.matchScore >= minScore)
            .sort((a, b) => b.matchScore - a.matchScore);

        // Pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return {
            jobs: paginated,
            pagination: { page, limit, total, totalPages },
            candidateSkills: Array.from(candidateSkills),
            hiddenGemCount: filtered.filter(j => j.isHiddenGem).length
        };
    }

    async getSkillGaps(userId: string) {
        const candidate = await Candidate.findOne({ user: userId });
        if (!candidate) {
            throw new Error('Candidate profile not found');
        }

        // Get all active jobs and count skill frequency
        const jobs = await Job.find({ isActive: true })
            .select('requiredSkills preferredSkills title')
            .lean();

        const candidateSkills = new Set((candidate.skills || []).map((s: string) => s.toLowerCase()));

        // Count how many jobs require each skill
        const skillDemand: Record<string, { count: number; jobs: string[] }> = {};

        for (const job of jobs) {
            const allSkills = [
                ...(job.requiredSkills || []),
                ...(job.preferredSkills || [])
            ];
            for (const skill of allSkills) {
                const lower = skill.toLowerCase();
                if (!candidateSkills.has(lower)) {
                    if (!skillDemand[lower]) {
                        skillDemand[lower] = { count: 0, jobs: [] };
                    }
                    skillDemand[lower].count++;
                    if (skillDemand[lower].jobs.length < 3) {
                        skillDemand[lower].jobs.push(job.title);
                    }
                }
            }
        }

        // Sort by demand and take top 8
        const topGaps = Object.entries(skillDemand)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 8)
            .map(([skill, data]) => ({
                skill: skill.charAt(0).toUpperCase() + skill.slice(1),
                jobsUnlocked: data.count,
                exampleJobs: data.jobs,
                impact: data.count >= 5 ? 'high' : data.count >= 3 ? 'medium' : 'low'
            }));

        return {
            currentSkills: candidate.skills || [],
            gaps: topGaps,
            totalJobs: jobs.length,
            matchableJobs: jobs.filter(job => {
                const required = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
                return required.some((s: string) => candidateSkills.has(s));
            }).length
        };
    }
}

export const jobDiscoveryService = new JobDiscoveryService();
