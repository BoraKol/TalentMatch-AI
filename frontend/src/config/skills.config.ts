export interface Skill {
    name: string;
    category: string;
    subcategory?: string;
    skillType: 'technical' | 'soft' | 'nice_to_have';
}

export const DEFAULT_SKILLS: Skill[] = [
    // === TECHNICAL SKILLS ===
    // Software Development - Frontend
    { name: 'HTML', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'CSS', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'JavaScript', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'TypeScript', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'React', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'Angular', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'Vue.js', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'Next.js', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'Tailwind CSS', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },
    { name: 'Sass/SCSS', category: 'Software Development', subcategory: 'Frontend', skillType: 'technical' },

    // Software Development - Backend
    { name: 'Node.js', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'Python', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'Java', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'C#', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'Go (Golang)', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'Rust', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'PHP', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },
    { name: 'Ruby', category: 'Software Development', subcategory: 'Backend', skillType: 'technical' },

    // Software Development - Frameworks
    { name: 'Express.js', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'NestJS', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'Django', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'Flask', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'Spring Boot', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'ASP.NET Core', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },
    { name: 'Laravel', category: 'Software Development', subcategory: 'Frameworks', skillType: 'technical' },

    // Mobile Development
    { name: 'React Native', category: 'Mobile Development', subcategory: 'Cross-Platform', skillType: 'technical' },
    { name: 'Flutter', category: 'Mobile Development', subcategory: 'Cross-Platform', skillType: 'technical' },
    { name: 'Swift', category: 'Mobile Development', subcategory: 'iOS', skillType: 'technical' },
    { name: 'SwiftUI', category: 'Mobile Development', subcategory: 'iOS', skillType: 'technical' },
    { name: 'Kotlin', category: 'Mobile Development', subcategory: 'Android', skillType: 'technical' },
    { name: 'Dart', category: 'Mobile Development', subcategory: 'Cross-Platform', skillType: 'technical' },

    // Data & AI
    { name: 'Pandas', category: 'Data & AI', subcategory: 'Data Science', skillType: 'technical' },
    { name: 'NumPy', category: 'Data & AI', subcategory: 'Data Science', skillType: 'technical' },
    { name: 'Jupyter', category: 'Data & AI', subcategory: 'Data Science', skillType: 'technical' },
    { name: 'R', category: 'Data & AI', subcategory: 'Data Science', skillType: 'technical' },
    { name: 'TensorFlow', category: 'Data & AI', subcategory: 'AI/ML', skillType: 'technical' },
    { name: 'PyTorch', category: 'Data & AI', subcategory: 'AI/ML', skillType: 'technical' },
    { name: 'Scikit-learn', category: 'Data & AI', subcategory: 'AI/ML', skillType: 'technical' },
    { name: 'OpenAI API', category: 'Data & AI', subcategory: 'AI/ML', skillType: 'technical' },
    { name: 'LangChain', category: 'Data & AI', subcategory: 'AI/ML', skillType: 'technical' },
    { name: 'Apache Spark', category: 'Data & AI', subcategory: 'Data Engineering', skillType: 'technical' },
    { name: 'Airflow', category: 'Data & AI', subcategory: 'Data Engineering', skillType: 'technical' },
    { name: 'dbt', category: 'Data & AI', subcategory: 'Data Engineering', skillType: 'technical' },

    // Cloud & DevOps
    { name: 'AWS', category: 'Cloud & DevOps', subcategory: 'Cloud Platforms', skillType: 'technical' },
    { name: 'Azure', category: 'Cloud & DevOps', subcategory: 'Cloud Platforms', skillType: 'technical' },
    { name: 'Google Cloud (GCP)', category: 'Cloud & DevOps', subcategory: 'Cloud Platforms', skillType: 'technical' },
    { name: 'Docker', category: 'Cloud & DevOps', subcategory: 'Containers', skillType: 'technical' },
    { name: 'Kubernetes', category: 'Cloud & DevOps', subcategory: 'Containers', skillType: 'technical' },
    { name: 'Helm', category: 'Cloud & DevOps', subcategory: 'Containers', skillType: 'technical' },
    { name: 'Jenkins', category: 'Cloud & DevOps', subcategory: 'CI/CD', skillType: 'technical' },
    { name: 'GitHub Actions', category: 'Cloud & DevOps', subcategory: 'CI/CD', skillType: 'technical' },
    { name: 'GitLab CI', category: 'Cloud & DevOps', subcategory: 'CI/CD', skillType: 'technical' },
    { name: 'Terraform', category: 'Cloud & DevOps', subcategory: 'IaC', skillType: 'technical' },
    { name: 'Ansible', category: 'Cloud & DevOps', subcategory: 'IaC', skillType: 'technical' },
    { name: 'Git', category: 'Cloud & DevOps', subcategory: 'Version Control', skillType: 'technical' },

    // Databases
    { name: 'PostgreSQL', category: 'Databases', subcategory: 'Relational', skillType: 'technical' },
    { name: 'MySQL', category: 'Databases', subcategory: 'Relational', skillType: 'technical' },
    { name: 'SQL Server', category: 'Databases', subcategory: 'Relational', skillType: 'technical' },
    { name: 'Oracle', category: 'Databases', subcategory: 'Relational', skillType: 'technical' },
    { name: 'MongoDB', category: 'Databases', subcategory: 'NoSQL', skillType: 'technical' },
    { name: 'Redis', category: 'Databases', subcategory: 'NoSQL', skillType: 'technical' },
    { name: 'Elasticsearch', category: 'Databases', subcategory: 'NoSQL', skillType: 'technical' },
    { name: 'DynamoDB', category: 'Databases', subcategory: 'NoSQL', skillType: 'technical' },
    { name: 'Firebase', category: 'Databases', subcategory: 'NoSQL', skillType: 'technical' },

    // Networking & Security
    { name: 'TCP/IP', category: 'Networking & Security', subcategory: 'Networking', skillType: 'technical' },
    { name: 'DNS', category: 'Networking & Security', subcategory: 'Networking', skillType: 'technical' },
    { name: 'Load Balancing', category: 'Networking & Security', subcategory: 'Networking', skillType: 'technical' },
    { name: 'Penetration Testing', category: 'Networking & Security', subcategory: 'Cybersecurity', skillType: 'technical' },
    { name: 'IAM', category: 'Networking & Security', subcategory: 'Cybersecurity', skillType: 'technical' },

    // Design & UX
    { name: 'Figma', category: 'Design & UX', subcategory: 'Design Tools', skillType: 'technical' },
    { name: 'Adobe XD', category: 'Design & UX', subcategory: 'Design Tools', skillType: 'technical' },
    { name: 'User Research', category: 'Design & UX', subcategory: 'UX', skillType: 'technical' },
    { name: 'Prototyping', category: 'Design & UX', subcategory: 'UX', skillType: 'technical' },

    // === SOFT SKILLS ===
    { name: 'Communication', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Problem Solving', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Team Collaboration', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Time Management', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Adaptability', category: 'Soft Skills', skillType: 'soft' },
    { name: 'Leadership', category: 'Soft Skills', skillType: 'soft' },

    // === NICE TO HAVE ===
    { name: 'Agile/Scrum', category: 'Nice to Have', skillType: 'nice_to_have' },
    { name: 'JIRA', category: 'Nice to Have', skillType: 'nice_to_have' },
    { name: 'Technical Writing', category: 'Nice to Have', skillType: 'nice_to_have' },
    { name: 'Open Source Contribution', category: 'Nice to Have', skillType: 'nice_to_have' }
];
