// 檔案路徑: src/app/features/ebook/services/ebook.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // [新增] 匯入 of 來建立 Observable
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { PaginatedResponseDto } from '../DTOs/paginated-response.dto';
import { BOOKS_DATA } from '../book-list/books.data'; // [新增] 匯入我們的假資料

@Injectable({
    providedIn: 'root'
})
export class EbookService {
    private apiUrl = 'https://localhost:7151/api/ebooks';

    constructor(private http: HttpClient) { }

    // 取得「真實」書籍列表 (從 API)
    getEbooksFromApi(pageNumber: number, pageSize: number, search?: string): Observable<PaginatedResponseDto<EBookSummaryDto>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedResponseDto<EBookSummaryDto>>(this.apiUrl, { params });
    }

    // [新增] 取得「假」書籍列表 (從本地)
    getEbooksFromLocal(pageNumber: number, pageSize: number): Observable<PaginatedResponseDto<EBookSummaryDto>> {
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = BOOKS_DATA.slice(startIndex, endIndex);

        const response: PaginatedResponseDto<any> = {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount: BOOKS_DATA.length,
            totalPages: Math.ceil(BOOKS_DATA.length / pageSize),
            items: items
        };

        // 使用 of() 將我們的假回應，包裝成一個會立即回傳的 Observable
        return of(response);
    }
}
