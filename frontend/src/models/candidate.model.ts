export interface Candidate {
    _id?: string;
    id?: number | string; // Compatibility
    name: string;
    role?: string;
    avatar?: string;
    email?: string;
    bio?: string;
    skills: string[];
    experience?: string | number;
    currentTitle?: string;
    firstName?: string;
    lastName?: string;
}
