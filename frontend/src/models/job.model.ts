export interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    salaryRange?: { min: number; max: number; currency: string } | string;
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    experienceRequired?: number;
    isActive?: boolean;
    createdAt?: string;
}
