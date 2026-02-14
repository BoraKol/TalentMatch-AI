import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Candidate } from '../models/candidate.model';

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/candidates`;

    getCandidates(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(this.apiUrl);
    }

    createCandidate(candidate: Candidate): Observable<Candidate> {
        return this.http.post<Candidate>(this.apiUrl, candidate);
    }

    inviteCandidate(id: string | number, jobTitle: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/invite`, { jobTitle });
    }

    getCandidateById(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
    }

    updateCandidate(id: string, data: Partial<Candidate>): Observable<Candidate> {
        return this.http.put<Candidate>(`${this.apiUrl}/${id}`, data);
    }

    deleteCandidate(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
