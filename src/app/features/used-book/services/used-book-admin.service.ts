import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AdminBookListItemDto } from '../dtos/admin-book-list-item.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookAdminService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/admin/books`;

    constructor(private http: HttpClient) { }

    getAdminBookList(query: BookListQuery): Observable<AdminBookListItemDto[]> {
        const params = this.toHttpParams(query);
        return this.http.get<AdminBookListItemDto[]>(`${this.baseUrl}?${params}`);
    }

    private toHttpParams(q: BookListQuery): HttpParams {
        let p = new HttpParams();
        Object.entries(q).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                p = p.set(k.charAt(0).toLowerCase() + k.slice(1), String(v));
            }
        });
        return p;
    }
}
