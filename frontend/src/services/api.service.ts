import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';



@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = config.apiUrl;

    constructor(private http: HttpClient) { }

    getAnalyticsDashboard(): Observable<any> {
        return this.http.get(`${this.apiUrl}/analytics/dashboard`);
    }
}
