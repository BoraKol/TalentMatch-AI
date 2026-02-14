import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Application } from '../models/application.model';

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/applications`;

    applyForJob(jobId: string, aiMatchScore?: number): Observable<Application> {
        return this.http.post<Application>(`${this.apiUrl}/apply`, { jobId, aiMatchScore });
    }

    getMyApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.apiUrl}/my-applications`);
    }

    getRecommendedJobs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/recommended-jobs`);
    }
}
