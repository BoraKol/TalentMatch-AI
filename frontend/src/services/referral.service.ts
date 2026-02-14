import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReferralPosition } from '../models/referral.model';

@Injectable({
    providedIn: 'root'
})
export class ReferralService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/referrals`;

    getMyReferrals(): Observable<ReferralPosition[]> {
        return this.http.get<ReferralPosition[]>(`${this.apiUrl}/my`);
    }

    respondToReferral(referralId: string, action: 'accepted' | 'declined'): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${referralId}/respond`, { action });
    }
}
