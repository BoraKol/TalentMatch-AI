import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface Institution {
    _id?: string;
    name: string;
    type: 'University' | 'Corporate' | 'Agency';
    emailDomain: string;
    adminEmail: string;
    status?: 'active' | 'pending' | 'suspended';
}

@Injectable({
    providedIn: 'root'
})
export class InstitutionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/institutions`;

    institutions = signal<Institution[]>([]);

    getAll(): Observable<Institution[]> {
        return this.http.get<Institution[]>(this.apiUrl).pipe(
            tap(list => this.institutions.set(list))
        );
    }

    create(institution: Institution): Observable<Institution> {
        return this.http.post<Institution>(this.apiUrl, institution).pipe(
            tap(newInst => this.institutions.update(list => [...list, newInst]))
        );
    }

    inviteAdmin(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/invite`, {});
    }

    updateStatus(id: string, status: 'active' | 'suspended' | 'pending'): Observable<Institution> {
        return this.http.patch<Institution>(`${this.apiUrl}/${id}/status`, { status }).pipe(
            tap(updated => {
                this.institutions.update(list => list.map(i => i._id === id ? updated : i));
            })
        );
    }
}
