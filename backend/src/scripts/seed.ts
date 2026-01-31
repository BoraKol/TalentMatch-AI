import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from '../models/candidate.model';
import Job from '../models/job.model';
import User from '../models/user.model'; // Need a user to assign candidates to

dotenv.config();

const candidates = [
    {
        firstName: "Elara",
        lastName: "Vance",
        currentTitle: "Senior Frontend Dev",
        email: "elara.vance@ethereal.email",
        status: 'hired',
        institution: 'MIT',
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

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        // Check if a user exists
        let user = await User.findOne({ email: 'demo@talentmatch.ai' });
        if (!user) {
            user = await User.create({
                name: 'Demo Recruiter',
                email: 'demo@talentmatch.ai',
                password: 'password123',
                role: 'recruiter'
            });
            console.log('Created Demo User');
        }

        // Clear existing candidates and jobs
        await Candidate.deleteMany({});
        await Job.deleteMany({});
        console.log('Cleared DB');

        // Insert Jobs
        const seededJobs = await Job.insertMany(jobs.map(j => ({ ...j, postedBy: user?._id })));
        console.log(`Seeded ${seededJobs.length} jobs`);

        // Insert new candidates
        const candidatesWithUser = candidates.map(c => ({ ...c, user: user?._id }));
        await Candidate.insertMany(candidatesWithUser);
        console.log(`Seeded ${candidates.length} candidates`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
