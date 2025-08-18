import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { SellerBookListItemDto } from '../dtos/seller-book-list-item.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookSellerService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/seller/books`;

    constructor(private http: HttpClient) { }

    getSellerBookList(query: BookListQuery): Observable<SellerBookListItemDto[]> {
        const params = this.toHttpParams(query);
        return this.http.get<SellerBookListItemDto[]>(`${this.baseUrl}?${params}`);
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
