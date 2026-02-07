import { Request, Response } from 'express';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';
import User from '../models/user.model';
import Institution from '../models/institution.model';
import bcrypt from 'bcrypt';

export const seedDatabase = async (req: Request, res: Response) => {
    try {
        console.log('Seeding Database via API...');

        // Create Super Admin if not exists
        let superAdmin = await User.findOne({ email: 'superadmin@talentmatch.ai' });
        if (!superAdmin) {
            const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
            superAdmin = await User.create({
                email: 'superadmin@talentmatch.ai',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'super_admin',
                isActive: true
            });
            console.log('Created Super Admin User');
        }

        // Check if a demo recruiter exists
        let user = await User.findOne({ email: 'demo@talentmatch.ai' });
        if (!user) {
            user = await User.create({
                email: 'demo@talentmatch.ai',
                password: 'password123',
                firstName: 'Demo',
                lastName: 'Recruiter',
                role: 'recruiter',
                isActive: true
            });
            console.log('Created Demo User');
        }

        // Clear existing candidates, jobs, and institutions
        await Candidate.deleteMany({});
        await Job.deleteMany({});
        await Institution.deleteMany({});
        console.log('Cleared DB');

        const institutions = [
            { name: 'MIT', type: 'University', emailDomain: 'mit.edu', adminEmail: 'admin@mit.edu', status: 'active' },
            { name: 'Stanford', type: 'University', emailDomain: 'stanford.edu', adminEmail: 'admin@stanford.edu', status: 'active' },
            { name: 'Google', type: 'Corporate', emailDomain: 'google.com', adminEmail: 'admin@google.com', status: 'active' },
            { name: 'TechRecruiters', type: 'Agency', emailDomain: 'techrecruiters.com', adminEmail: 'contact@techrecruiters.com', status: 'pending' },
            { name: 'Old School', type: 'University', emailDomain: 'oldschool.edu', adminEmail: 'admin@oldschool.edu', status: 'suspended' }
        ];
        const seededInsts = await Institution.insertMany(institutions);
        console.log('Seeded Institutions');

        const candidates = [
            {
                firstName: "Elara",
                lastName: "Vance",
                currentTitle: "Senior Frontend Dev",
                email: "elara.vance@ethereal.email",
                status: 'hired',
                institution: 'MIT',
                school: 'MIT',
                bio: "Passionate about UI/UX and building accessible web applications. 5 years of experience with Angular and React.",
                skills: ["Angular", "TypeScript", "Tailwind", "Figma", "Accessibility"],
                experience: 5
            },
            {
                firstName: "Marcus",
                lastName: "Chen",
                currentTitle: "Full Stack Engineer",
                email: "marcus.chen@ethereal.email",
                status: 'interviewing',
                institution: 'Stanford',
                school: 'Stanford',
                bio: "Full stack wizard who loves optimizing backend queries as much as pixel-perfect CSS. Expert in Node.js and Cloud architecture.",
                skills: ["Node.js", "React", "AWS", "PostgreSQL", "Docker"],
                experience: 4
            },
            {
                firstName: "Sarah",
                lastName: "Jenkins",
                currentTitle: "Product Designer",
                email: "sarah.jenkins@ethereal.email",
                status: 'hired',
                institution: 'Parsons School of Design',
                school: 'Parsons',
                bio: "Creative designer with a knack for user-centered design principles. I bridge the gap between design and code.",
                skills: ["Figma", "Adobe XD", "CSS", "HTML", "User Research"],
                experience: 3
            },
            {
                firstName: "David",
                lastName: "Ross",
                currentTitle: "Backend Specialist",
                email: "david.ross@ethereal.email",
                status: 'pending',
                institution: 'MIT',
                school: 'MIT',
                bio: "Deep knowledge of distributed systems and microservices. I build scalable APIs.",
                skills: ["Java", "Spring Boot", "Kubernetes", "Kafka", "System Design"],
                experience: 6
            },
            {
                firstName: "Priya",
                lastName: "Patel",
                currentTitle: "Frontend Developer",
                email: "priya.patel@ethereal.email",
                status: 'rejected',
                institution: 'Stanford',
                school: 'Stanford',
                bio: "Frontend enthusiast focused on performance and animations. Love working with modern JS frameworks.",
                skills: ["Vue.js", "JavaScript", "GSAP", "Sass"],
                experience: 2
            },
            {
                firstName: "James",
                lastName: "Wilson",
                currentTitle: "DevOps Engineer",
                email: "james.wilson@ethereal.email",
                status: 'hired',
                institution: 'Georgia Tech',
                school: 'Georgia Tech',
                bio: "Automating everything. CI/CD pipelines are my playground.",
                skills: ["Terraform", "Ansible", "AWS", "Python", "Bash"],
                experience: 4
            }
        ];

        const jobs = [
            { title: 'Frontend Engineer', description: 'React', company: 'Google', location: 'Remote', requirements: ['React'] },
            { title: 'Backend Dev', description: 'Node', company: 'Amazon', location: 'Seattle', requirements: ['Node'] },
            { title: 'Designer', description: 'Figma', company: 'Netflix', location: 'LA', requirements: ['Figma'] }
        ];

        // Insert Jobs
        const seededJobs = await Job.insertMany(jobs.map(j => ({ ...j, postedBy: user?._id })));

        // Insert new candidates
        const candidatesWithUser = candidates.map(c => ({ ...c, user: user?._id }));
        await Candidate.insertMany(candidatesWithUser);

        res.json({
            message: 'Database seeded successfully',
            stats: {
                candidates: candidates.length,
                jobs: jobs.length,
                institutions: institutions.length,
                user: user?.email
            }
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
