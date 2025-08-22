import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { SellerBookListItemDto } from '../dtos/seller-book-list-item.dto';
import { toHttpParams } from '../utils/book-list.query.mapper';

@Injectable({
    providedIn: 'root'
})
export class UsedBookSellerService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/seller`;

    constructor(private http: HttpClient) { }

    getSellerBookList(query: BookListQuery): Observable<SellerBookListItemDto[]> {
        query.paging.pageIndex = Math.max(query.paging.pageIndex - 1, 0);       // 1-base 轉 0-based
        const params = toHttpParams(query);
        console.log(params);
        return this.http.get<SellerBookListItemDto[]>(`${this.baseUrl}/books?${params}`);
    }
}
