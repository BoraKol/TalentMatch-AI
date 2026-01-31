import { CandidateService } from './candidate.service';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';
import User from '../models/user.model';

export class AnalyticsService {
    async getDashboardMetrics() {
        // Aggregate Data
        const totalCandidates = await Candidate.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalUsers = await User.countDocuments();

        // Skill Distribution
        const skillsAggregation = await Candidate.aggregate([
            { $unwind: "$skills" },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Experience Distribution
        const experienceAggregation = await Candidate.aggregate([
            {
                $bucket: {
                    groupBy: "$experience",
                    boundaries: [0, 2, 5, 10, 20],
                    default: "20+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Hores by Institution
        const hiresByInstitution = await Candidate.aggregate([
            { $match: { status: 'hired' } },
            { $group: { _id: "$institution", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Employers by Hires (Mock logic: Assuming each job represents a hire capacity or using aggregated Job Company data)
        // Since we don't have explicit "Candidate X hired by Company Y" link in Candidate (only Status),
        // we will approximate or use Job distribution as "Top Hiring Companies" based on Open Positions for now, 
        // OR better, we update the Candidate model later to include 'hiredBy'. 
        // For this request, let's show "Top Hiring Companies" as "Companies with most Open Jobs" 
        // OR we can infer if we added a `hiredBy` field.
        // Let's use Open Jobs for "Top Employers" visualization for now as it's cleaner without complex linking.
        const topEmployers = await Job.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

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
}
