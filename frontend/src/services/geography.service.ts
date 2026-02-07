import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Country {
    name: string;
    iso2: string;
}

interface CountriesResponse {
    error: boolean;
    msg: string;
    data: Country[];
}

interface CitiesResponse {
    error: boolean;
    msg: string;
    data: string[];
}

@Injectable({
    providedIn: 'root'
})
export class GeographyService {
    private http = inject(HttpClient);
    private baseUrl = 'https://countriesnow.space/api/v0.1/countries';

    getCountries(): Observable<Country[]> {
        return this.http.get<CountriesResponse>(`${this.baseUrl}/iso`).pipe(
            map(res => res.data)
        );
    }

    getCities(countryName: string): Observable<string[]> {
        return this.http.post<CitiesResponse>(`${this.baseUrl}/cities`, { country: countryName }).pipe(
            map(res => res.data)
        );
    }
}
