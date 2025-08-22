import { UpdateStatusRequestDto } from './../dtos/update-status-request.dto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicBookListItemDto } from '../dtos/public-book-list-item.dto';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { PublicBookDetailDto } from '../dtos/public-book-detail-dto';
import { UpdateBookPayloadDto } from '../dtos/update-book-payload.dto';
import { PagedResult } from 'app/features/fund/models';
import { toHttpParams } from '../utils/book-list.query.mapper';
import { UpdateBookSaleTagRequestDto } from '../dtos/update-book-sale-tag-request.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/books`;

    constructor(private http: HttpClient) { }

    creatBook(request: FormData): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}`, request);
    }

    updateBook(id: string, request: FormData): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/${id}`, request);
    }

    getUpdatePayload(id: string): Observable<UpdateBookPayloadDto> {
        return this.http.get<UpdateBookPayloadDto>(`${this.baseUrl}/payload/${id}`);
    }

    updateBookActiveStatus(id: string, request: UpdateStatusRequestDto): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/${id}/active`, request);
    }

    getPublicBookList(query: BookListQuery): Observable<PagedResult<PublicBookListItemDto>> {
        query.paging.pageIndex = Math.max(query.paging.pageIndex - 1, 0);       // 1-base 轉 0-based
        const params = toHttpParams(query);
        return this.http.get<PagedResult<PublicBookListItemDto>>(`${this.baseUrl}?${params}`);
    }

    getPublicDetail(id: string): Observable<PublicBookDetailDto> {
        return this.http.get<PublicBookDetailDto>(`${this.baseUrl}/${id}`);
    }

    // ========== 子屬性 - 標籤 ==========

    applyBookSaleTag(bookId: string, tagId: number): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/${bookId}/sale-tags/${tagId}`, {});
    }

    removeBookSaleTag(bookId: string, tagId: number): Observable<null> {
        return this.http.delete<null>(`${this.baseUrl}/${bookId}/sale-tags/${tagId}`);
    }

    updateBookSaleTagBatch(request: UpdateBookSaleTagRequestDto): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/sale-tags/batch`, request);
    }
}
