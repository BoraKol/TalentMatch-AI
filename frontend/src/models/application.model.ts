export interface Application {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        location: string;
        employmentType: string;
        salaryRange?: string;
        requiredSkills?: string[];
        isActive: boolean;
    };
    status: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired';
    aiMatchScore: number;
    createdAt: string;
    candidate?: string; // ID of the candidate
}
