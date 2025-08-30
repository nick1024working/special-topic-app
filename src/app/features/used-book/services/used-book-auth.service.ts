import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CurrentSellerDto } from '../dtos/current-seller.dto';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks`;

    constructor(private http: HttpClient) { }

    getSellerList(): Observable<CurrentSellerDto[]> {
        return this.http.get<CurrentSellerDto[]>(`${this.baseUrl}/sellers`);
    }

    getCurrentSeller(): Observable<string> {
        return this.http.get<string>(`${this.baseUrl}/current-seller`, { withCredentials: true });
    }

    setCurrentSeller(id: string): Observable<void> {
        console.log(id);
        return this.http.put<void>(`${this.baseUrl}/current-seller`, { id }, { withCredentials: true });
    }

    clearCurrentSeller(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/current-seller`, { withCredentials: true });
    }
}

