import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getPendingValidations(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/pending-validations`);
    }

    approveInstitution(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/approve-institution/${id}`, {});
    }

    approveEmployer(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/approve-employer/${id}`, {});
    }

    rejectValidation(type: 'user' | 'institution', id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reject`, { type, id });
    }
}
