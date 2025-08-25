// 檔案路徑: src/app/features/ebook/services/ebook.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

    // [新增] 建立一個私有方法，專門用來取得包含 JWT Token 的 HttpHeaders
    private getAuthHeaders(): HttpHeaders {
        // 從瀏覽器的 localStorage 取得 token
        // 這個 'token' 的鍵值，必須和您登入成功後儲存 token 的鍵值一致
        const token = localStorage.getItem('token');

        if (token) {
            // 如果 token 存在，就建立一個帶有 'Authorization' 標頭的 HttpHeaders 物件
            return new HttpHeaders().set('Authorization', 'Bearer ' + token);
        }
        // 如果 token 不存在，就回傳一個空的 HttpHeaders
        return new HttpHeaders();
    }

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

    // getPurchasedBooks(): Observable<PurchasedBookDto[]> {
    //     // [修改] 在基礎路徑後面加上 /ebooks/purchased
    //     const url = `${this.apiUrl}/ebooks/purchased`;
    //     return this.http.get<PurchasedBookDto[]>(url);
    // }

    // --- [重大修改] 這個 API 需要登入才能存取 ---

    getPurchasedBooks(): Observable<PurchasedBookDto[]> {
        const url = `${this.apiUrl}/ebooks/purchased`;

        // [修改] 在發送請求前，先呼叫 getAuthHeaders() 來取得驗證標頭
        const headers = this.getAuthHeaders();

        // [修改] 將 headers 物件放入 http.get 的選項中一併送出
        return this.http.get<PurchasedBookDto[]>(url, { headers: headers });
    }

    getCategories(): Observable<HierarchicalCategoryDto[]> {
        // [修改] 在基礎路徑後面加上 /categories，現在網址就正確了
        return this.http.get<HierarchicalCategoryDto[]>(`${this.apiUrl}/categories`);
    }
}
