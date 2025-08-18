import { UpdateStatusRequestDto } from './../dtos/update-status-request.dto';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicBookListItemDto } from '../dtos/public-book-list-item.dto';
import { BookListQuery } from '../dtos/book-list-query.dto';
import { PublicBookDetailDto } from '../dtos/public-book-detail-dto';
import { UpdateBookPayloadDto } from '../dtos/update-book-payload.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/books`;

    constructor(private http: HttpClient) { }

    getPublicBookList(query: BookListQuery): Observable<PublicBookListItemDto[]> {
        const params = this.toHttpParams(query);
        return this.http.get<PublicBookListItemDto[]>(`${this.baseUrl}?${params}`);
    }

    getPublicDetail(id: string): Observable<PublicBookDetailDto> {
        return this.http.get<PublicBookDetailDto>(`${this.baseUrl}/${id}`);
    }

    getUpdatePayload(id: string): Observable<UpdateBookPayloadDto> {
        return this.http.get<UpdateBookPayloadDto>(`${this.baseUrl}/payload/${id}`);
    }

    creatBook(request: FormData): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}`, request);
    }

    updateBook(id: string, request: FormData): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/${id}`, request);
    }

    deleteBook(id: string, request: UpdateStatusRequestDto): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/${id}/active`, request);
    }


    private toHttpParams(q: BookListQuery): HttpParams {
        let p = new HttpParams();
        Object.entries(q).forEach(([k, v]) => {
            if (v === undefined || v === null || v === '') return;

            const key = k.charAt(0).toLowerCase() + k.slice(1);
            // ASP.NET Core 預設要求 query string 重複多次 "?saleTagIds=1&saleTagIds=4" 而非 "saleTagIds=1,4"
            if (k === 'saleTagIds' && Array.isArray(v)) {
                v.forEach(id => {p = p.append('saleTagIds', String(id))});
            } else {
                p = p.set(key, String(v));
            }
        });
        return p;
    }
}
