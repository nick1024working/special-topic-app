// 檔案路徑: src/app/features/ebook/services/ebook.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { PaginatedResponseDto } from '../DTOs/paginated-response.dto';
import { PurchasedBookDto } from '../DTOs/purchased-book.dto';
import { HierarchicalCategoryDto } from '../DTOs/category.dto';

@Injectable({
    providedIn: 'root'
})
export class EbookService {
    // [修改] 將 apiUrl 改為 API 的基礎路徑
    private apiUrl = 'https://localhost:7104/api';

    constructor(private http: HttpClient) { }

    getEbooks(pageNumber: number, pageSize: number, search?: string, categoryId?: number): Observable<PaginatedResponseDto<EBookSummaryDto>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (search && search.trim() !== '') {
            params = params.set('search', search);
        }
        if (categoryId && categoryId > 0) {
            params = params.set('categoryId', categoryId.toString());
        }

        // [修改] 在基礎路徑後面加上 /ebooks
        return this.http.get<PaginatedResponseDto<EBookSummaryDto>>(`${this.apiUrl}/ebooks`, { params });
    }

    getEbookById(id: number): Observable<any> {
        // [修改] 在基礎路徑後面加上 /ebooks/{id}
        const url = `${this.apiUrl}/ebooks/${id}`;
        return this.http.get<any>(url);
    }

    getPurchasedBooks(): Observable<PurchasedBookDto[]> {
        // [修改] 在基礎路徑後面加上 /ebooks/purchased
        const url = `${this.apiUrl}/ebooks/purchased`;
        return this.http.get<PurchasedBookDto[]>(url);
    }

    getCategories(): Observable<HierarchicalCategoryDto[]> {
        // [修改] 在基礎路徑後面加上 /categories，現在網址就正確了
        return this.http.get<HierarchicalCategoryDto[]>(`${this.apiUrl}/categories`);
    }
}
