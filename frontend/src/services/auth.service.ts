import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    role: 'super_admin' | 'institution_admin' | 'candidate';
    token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    // Signals for reactive state
    currentUser = signal<User | null>(this.getUserFromStorage());
    isAuthenticated = signal<boolean>(!!this.getUserFromStorage());

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: any) {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.token && response.user) {
                    const user = { ...response.user, token: response.token };
                    this.setSession(user);
                }
            })
        );
    }

    registerCandidate(data: any) {
        return this.http.post(`${this.apiUrl}/register/candidate`, data);
    }

    logout() {
        localStorage.removeItem('user_session');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    private setSession(user: User) {
        localStorage.setItem('user_session', JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
    }

    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem('user_session');
        return userStr ? JSON.parse(userStr) : null;
    }

    getAuthHeaders() {
        const user = this.currentUser();
        return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
    }
}
