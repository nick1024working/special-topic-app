import { UpdateStatusRequestDto } from './../dtos/update-status-request.dto';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicBookListItemDto } from '../dtos/public-book-list-item.dto';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { PublicBookDetailDto } from '../dtos/public-book-detail-dto';
import { UpdateBookPayloadDto } from '../dtos/update-book-payload.dto';
import { PagedResult } from 'app/features/fund/models';
import { toHttpParams } from '../utils/book-list.query.mapper';

@Injectable({
    providedIn: 'root'
})
export class UsedBookService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/books`;

    constructor(private http: HttpClient) { }

    getPublicBookList(query: BookListQuery): Observable<PagedResult<PublicBookListItemDto>> {
        console.log("[service]", query);
        const params = toHttpParams(query);
        console.log("[service]", params);
        return this.http.get<PagedResult<PublicBookListItemDto>>(`${this.baseUrl}?${params}`);
    }

    getPublicDetail(id: string): Observable<PublicBookDetailDto> {
        return this.http.get<PublicBookDetailDto>(`${this.baseUrl}/${id}`);
    }

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
}
