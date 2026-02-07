import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface AlgorithmSettings {
    primarySkillPoints: number;
    secondarySkillPoints: number;
    softSkillPoints: number;
    niceToHavePoints: number;
}

export interface Skill {
    _id?: string;
    name: string;
    category: string;
}

export interface EmploymentType {
    _id?: string;
    name: string;
    level: number;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/settings`;

    // Signals for state management
    algorithmSettings = signal<AlgorithmSettings>({
        primarySkillPoints: 10,
        secondarySkillPoints: 5,
        softSkillPoints: 3,
        niceToHavePoints: 1
    });

    skills = signal<Skill[]>([]);
    employmentTypes = signal<EmploymentType[]>([]);

    // Algorithm Settings
    getAlgorithmSettings(): Observable<AlgorithmSettings> {
        return this.http.get<AlgorithmSettings>(`${this.apiUrl}/algorithm`).pipe(
            tap(settings => this.algorithmSettings.set(settings))
        );
    }

    updateAlgorithmSettings(settings: AlgorithmSettings): Observable<AlgorithmSettings> {
        return this.http.put<AlgorithmSettings>(`${this.apiUrl}/algorithm`, settings).pipe(
            tap(updated => this.algorithmSettings.set(updated))
        );
    }

    // Skills Management
    getSkills(): Observable<Skill[]> {
        return this.http.get<Skill[]>(`${this.apiUrl}/skills`).pipe(
            tap(skills => this.skills.set(skills))
        );
    }

    addSkill(skill: Skill): Observable<Skill> {
        return this.http.post<Skill>(`${this.apiUrl}/skills`, skill).pipe(
            tap(newSkill => this.skills.update(list => [...list, newSkill]))
        );
    }

    deleteSkill(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/skills/${id}`).pipe(
            tap(() => this.skills.update(list => list.filter(s => s._id !== id)))
        );
    }

    // Employment Types Management
    getEmploymentTypes(): Observable<EmploymentType[]> {
        return this.http.get<EmploymentType[]>(`${this.apiUrl}/employment-types`).pipe(
            tap(types => this.employmentTypes.set(types))
        );
    }

    addEmploymentType(type: EmploymentType): Observable<EmploymentType> {
        return this.http.post<EmploymentType>(`${this.apiUrl}/employment-types`, type).pipe(
            tap(newType => this.employmentTypes.update(list => [...list, newType]))
        );
    }

    deleteEmploymentType(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/employment-types/${id}`).pipe(
            tap(() => this.employmentTypes.update(list => list.filter(t => t._id !== id)))
        );
    }
}
