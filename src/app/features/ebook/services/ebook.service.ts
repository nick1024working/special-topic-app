import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { PaginatedResponseDto } from '../DTOs/paginated-response.dto';

@Injectable({
    providedIn: 'root'
})
export class EbookService {
    private apiUrl = 'https://localhost:7104/api/ebooks'; // 確認您的後端 port 正確

    constructor(private http: HttpClient) { }

    getEbooks(pageNumber: number, pageSize: number, search?: string): Observable<PaginatedResponseDto<EBookSummaryDto>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (search && search.trim() !== '') {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedResponseDto<EBookSummaryDto>>(this.apiUrl, { params });
    }
}
