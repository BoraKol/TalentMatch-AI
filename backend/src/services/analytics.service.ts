import { CandidateService } from './candidate.service';
import { candidateRepository } from '../repositories/candidate.repository';
import { jobRepository } from '../repositories/job.repository';
import { userRepository } from '../repositories/user.repository';

export class AnalyticsService {
    async getDashboardMetrics() {
        // Aggregate Data via Repositories (or direct aggregation if complex)
        // Note: For complex aggregations, repositories should have dedicated methods.
        const [totalCandidates, totalJobs, totalUsers] = await Promise.all([
            candidateRepository.count({}),
            jobRepository.count({}),
            userRepository.count({})
        ]);

        // Skill Distribution - ideally moved to repository
        const skillsAggregation = await candidateRepository.getSkillDistribution(10);

        // Experience Distribution
        const experienceAggregation = await candidateRepository.getExperienceDistribution();

        // Hires by Institution
        const hiresByInstitution = await candidateRepository.getHiresByInstitution();

        const topEmployers = await jobRepository.getTopEmployers();

        return {
            summary: {
                totalCandidates,
                totalJobs,
                totalUsers
            },
            skills: skillsAggregation.map(s => ({ name: s._id, count: s.count })),
            experience: experienceAggregation.map(e => ({ range: `${e._id} Years`, count: e.count })),
            hiresByInstitution: hiresByInstitution.map(h => ({ name: h._id, count: h.count })),
            topEmployers: topEmployers.map(e => ({ name: e._id, count: e.count }))
        };
    }

    async getSuperAdminAnalytics() {
        // 1. Comparative Institution Performance (Hires)
        const institutionPerformance = await candidateRepository.getInstitutionPerformance();

        // 2. Candidate Distribution by Institution
        const candidateDistribution = await candidateRepository.getCandidateDistribution();

        // 3. User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Move to userRepository
        const userGrowth = await userRepository.getUserGrowth(sixMonthsAgo);

        // 4. Job Category Distribution
        const jobCategoryDistribution = await jobRepository.getJobCategoryDistribution();

        // 5. Total Metrics
        const [totalInstitutions, totalEmployers, totalJobs, totalCandidates] = await Promise.all([
            userRepository.countByRole('institution_admin'),
            userRepository.countByRole('employer'),
            jobRepository.count({}),
            candidateRepository.count({})
        ]);

        return {
            comparative: {
                institutions: institutionPerformance.map((i: any) => ({ name: i._id || 'Independent', hires: i.hires })),
                candidatesByInst: candidateDistribution.map((c: any) => ({ name: c._id || 'Other', count: c.count })),
                userGrowth: userGrowth.map((u: any) => ({ month: `${u._id.month}/${u._id.year}`, count: u.count })),
                jobTypes: jobCategoryDistribution.map((j: any) => ({ type: j._id, count: j.count }))
            },
            totals: {
                institutions: totalInstitutions,
                employers: totalEmployers,
                jobs: totalJobs,
                candidates: totalCandidates
            }
        };
    }
}

export const analyticsService = new AnalyticsService();
