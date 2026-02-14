import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class JobService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/jobs`;

    createJob(jobData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, jobData);
    }

    getJobMatches(jobId: string, forceRefresh = false): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/employer/jobs/${jobId}/matches`, { forceRefresh });
    }

    getJobById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateJob(id: string, jobData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, jobData);
    }

    deleteJob(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
