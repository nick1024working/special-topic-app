// 檔案路徑: src/app/features/ebook/services/ebook.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { PaginatedResponseDto } from '../DTOs/paginated-response.dto';
import { PurchasedBookDto } from '../DTOs/purchased-book.dto';
import { HierarchicalCategoryDto } from '../DTOs/category.dto';
import { RankingBookDto } from '../DTOs/ranking-book.dto';
import { UpdateProgressDto } from '../DTOs/update-progress.dto';
import { ReadingProgressDto } from '../DTOs/reading-progress.dto';
import { EbookCartItemDto } from '../DTOs/ebook-cart-item.dto';
import { LinePayRequestResponseDto } from '../DTOs/line-pay-request-response.dto';
import { CreatePaymentRequestDto } from '../DTOs/create-payment-request.dto';

@Injectable({
    providedIn: 'root'
})
export class EbookService {
    // [修改] 將 apiUrl 改為 API 的基礎路徑
    private apiUrl = 'https://localhost:7104/api';

    constructor(private http: HttpClient) { }

    // --- [重大修正] ---
    // private getAuthHeaders(): HttpHeaders {
    //     // 優先從 localStorage 讀取 (對應「記住我」)
    //     let token = localStorage.getItem('token');

    //     // 如果 localStorage 中沒有，再去 sessionStorage 讀取 (對應一般登入)
    //     if (!token) {
    //         token = sessionStorage.getItem('token');
    //     }

    //     // 如果 token 存在 (無論在哪找到)，就建立並回傳帶有 Authorization 的標頭
    //     if (token) {
    //         return new HttpHeaders().set('Authorization', 'Bearer ' + token);
    //     }

    //     // 如果兩處都沒有，回傳空的標頭
    //     return new HttpHeaders();
    // }
    // --- [修正結束] ---

    // [新增] 呼叫後端讀取進度 API 的方法
    // getReadingProgress(ebookId: number): Observable<ReadingProgressDto> {
    //     const url = `${this.apiUrl}/ebooks/purchased/${ebookId}/progress`;
    //     const headers = this.getAuthHeaders();
    //     return this.http.get<ReadingProgressDto>(url, { headers: headers });
    // }

    getReadingProgress(ebookId: number): Observable<ReadingProgressDto> {
        const url = `${this.apiUrl}/ebooks/purchased/${ebookId}/progress`;
        return this.http.get<ReadingProgressDto>(url, { withCredentials: true });
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

    // --- [核心修正] ---
    getPurchasedBooks(): Observable<PurchasedBookDto[]> {
        const url = `${this.apiUrl}/ebooks/purchased`;
        // [修改] 移除 headers，加上 withCredentials: true
        return this.http.get<PurchasedBookDto[]>(url, { withCredentials: true });
    }
    // --- [修正結束] ---

    // --- [重大修改] 這個 API 需要登入才能存取 ---

    // getPurchasedBooks(): Observable<PurchasedBookDto[]> {
    //     const url = `${this.apiUrl}/ebooks/purchased`;

    //     // [修改] 在發送請求前，先呼叫 getAuthHeaders() 來取得驗證標頭
    //     const headers = this.getAuthHeaders();

    //     // [修改] 將 headers 物件放入 http.get 的選項中一併送出
    //     return this.http.get<PurchasedBookDto[]>(url, { headers: headers });
    // }

    getCategories(): Observable<HierarchicalCategoryDto[]> {
        // [修改] 在基礎路徑後面加上 /categories，現在網址就正確了
        return this.http.get<HierarchicalCategoryDto[]>(`${this.apiUrl}/categories`);
    }


    // [新增] 呼叫後端排行榜 API 的方法
    getRankingBooks(): Observable<{ [key: string]: RankingBookDto[] }> {
        const url = `${this.apiUrl}/ebooks/rankings`;
        return this.http.get<{ [key: string]: RankingBookDto[] }>(url);
    }

    // [新增] 呼叫後端更新進度 API 的方法
    // updateReadingProgress(progressData: UpdateProgressDto): Observable<any> {
    //     const url = `${this.apiUrl}/ebooks/purchased/progress`;
    //     const headers = this.getAuthHeaders(); // 取得驗證標頭
    //     return this.http.post(url, progressData, { headers: headers });
    // }

    // // [新增] 專門用來下載 PDF 檔案的方法
    // getEbookFile(ebookId: number): Observable<Blob> {
    //     const url = `${this.apiUrl}/ebooks/${ebookId}/file`;
    //     const headers = this.getAuthHeaders();
    //     // 關鍵：設定 responseType 為 'blob'，讓 HttpClient 將回應視為二進位檔案
    //     return this.http.get(url, { headers: headers, responseType: 'blob' });
    // }

    // --- [核心修正] ---
    updateReadingProgress(progressData: UpdateProgressDto): Observable<any> {
        const url = `${this.apiUrl}/ebooks/purchased/progress`;
        // [修改] 移除 headers，加上 withCredentials: true
        return this.http.post(url, progressData, { withCredentials: true });
    }
    // --- [修正結束] ---

    // --- [核心修正] ---
    getEbookFile(ebookId: number): Observable<Blob> {
        const url = `${this.apiUrl}/ebooks/${ebookId}/file`;
        // [修改] 移除 headers，加上 withCredentials: true
        return this.http.get(url, { withCredentials: true, responseType: 'blob' });
    }
    // --- [修正結束] ---

    // // [新增] 呼叫後端建立訂單 API 的方法
    // createOrder(cartItems: EbookCartItemDto[]): Observable<{ orderId: number }> {
    //     const url = `${this.apiUrl}/EbookOrders`; // 對應 EbookOrdersController
    //     // 建立訂單需要使用者登入驗證，所以要加上 withCredentials: true
    //     return this.http.post<{ orderId: number }>(url, cartItems, { withCredentials: true });
    // }

    // --- [新增] 請求 LINE Pay 付款連結的方法 ---
    requestLinePay(orderId: number): Observable<LinePayRequestResponseDto> {
        // 這個路徑對應到您後端的 EbookLinePayController
        const url = `${this.apiUrl}/ebooks/line-pay/request/${orderId}`;
        // 我們只是觸發請求，不需要傳送 body，所以給一個空物件 {}
        return this.http.post<LinePayRequestResponseDto>(url, {}, { withCredentials: true });
    }

    // // --- [新增] 請求 ECPay 信用卡付款表單 ---
    // requestEcpayCreditCardPayment(orderId: number): Observable<string> {
    //     const requestBody: CreatePaymentRequestDto = { orderId };
    //     // 後端回傳的是 HTML 字串，所以必須設定 responseType: 'text'
    //     return this.http.post(`${this.apiUrl}/create-ecpay-payment`, requestBody, { responseType: 'text' });
    // }

    // // --- [新增] 請求 ECPay ATM 付款表單 ---
    // requestEcpayAtmPayment(orderId: number): Observable<string> {
    //     const requestBody: CreatePaymentRequestDto = { orderId };
    //     // 後端回傳的是 HTML 字串，所以必須設定 responseType: 'text'
    //     return this.http.post(`${this.apiUrl}/create-atm-payment`, requestBody, { responseType: 'text' });
    // }

}
