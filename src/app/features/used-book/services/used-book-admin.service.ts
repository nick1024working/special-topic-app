import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AdminBookListItemDto } from '../dtos/admin-book-list-item.dto';
import { toHttpParams } from '../utils/book-list.query.mapper';
import { PagedResultDto } from '../dtos/paged-result.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookAdminService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/admin`;

    constructor(private http: HttpClient) { }

    getAdminBookList(query: BookListQuery): Observable<PagedResultDto<AdminBookListItemDto>> {
        query.paging.pageIndex = Math.max(query.paging.pageIndex - 1, 0);       // 1-base 轉 0-based
        const params = toHttpParams(query);
        return this.http.get<PagedResultDto<AdminBookListItemDto>>(`${this.baseUrl}/books?${params}`);
    }
}
