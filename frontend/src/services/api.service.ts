import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

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
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = config.apiUrl;

    constructor(private http: HttpClient) { }

    getCandidates(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(`${this.apiUrl}/candidates`);
    }

    createCandidate(candidate: Candidate): Observable<Candidate> {
        return this.http.post<Candidate>(`${this.apiUrl}/candidates`, candidate);
    }

    inviteCandidate(id: string | number, jobTitle: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/candidates/${id}/invite`, { jobTitle });
    }

    getAnalyticsDashboard(): Observable<any> {
        return this.http.get(`${this.apiUrl}/analytics/dashboard`);
    }
}
