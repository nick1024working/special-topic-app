import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderHistoryDto } from '../DTOs/order-history.dto';
// 檔案: order.service.ts
import { EbookCartItemDto } from '../DTOs/ebook-cart-item.dto'; // <-- [修正] 改為匯入 EbookCartItemDto

// [新增] 將 BankTransferDetails 介面移到這裡，或是一個共享的 DTO 檔案中
// 這樣 Service 和 Component 都可以共用
export interface BankTransferDetails {
    orderId: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    amount: number;
    paymentDeadline: string;
}


@Injectable({
    providedIn: 'root'
})
export class OrderService {

    
    private apiUrl = 'https://localhost:7104/api/EbookOrders';

    constructor(private http: HttpClient) { }

    // 取得驗證標頭 (確保與其他 service 的邏輯一致)
    // private getAuthHeaders(): HttpHeaders {
    //     let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    //     if (token) {
    //         return new HttpHeaders().set('Authorization', 'Bearer ' + token);
    //     }
    //     return new HttpHeaders();
    // }

    // [修改] 取得歷史訂單 (現在會呼叫後端 API)
    // getOrders(): Observable<OrderHistoryDto[]> {
    //     const headers = this.getAuthHeaders();
    //     return this.http.get<OrderHistoryDto[]>(this.apiUrl, { headers });
    // }

    // // [新增] 建立新訂單 (呼叫後端 API)
    // createOrder(cartItems: CartItemDto[]): Observable<{ orderId: number }> {
    //     const headers = this.getAuthHeaders();
    //     return this.http.post<{ orderId: number }>(this.apiUrl, cartItems, { headers });
    // }

    getOrders(): Observable<OrderHistoryDto[]> {
        // [修改] 移除 headers，加上 withCredentials: true
        return this.http.get<OrderHistoryDto[]>(this.apiUrl, { withCredentials: true });
    }

    createOrder(cartItems: EbookCartItemDto[]): Observable<{ orderId: number }> {
        // [修改] 移除 headers，加上 withCredentials: true
        return this.http.post<{ orderId: number }>(this.apiUrl, cartItems, { withCredentials: true });
    }

    // --- [新增] 呼叫後端取消訂單 API 的方法 ---
    cancelOrder(orderId: string): Observable<any> {
        const url = `${this.apiUrl}/${orderId}/cancel`;
        // 使用 patch 方法，因為後端是 HttpPatch
        return this.http.patch(url, {}, { withCredentials: true });
    }

    // ========== [TODO] 的實作 ==========
    /**
     * 根據訂單 ID 獲取銀行轉帳詳細資訊
     * @param orderId 訂單的唯一識別碼
     * @returns 包含轉帳資訊的 Observable
     */
    getBankTransferDetails(orderId: string): Observable<BankTransferDetails> {
        const url = `${this.apiUrl}/${orderId}/bank-details`;
        return this.http.get<BankTransferDetails>(url);
    }
    // ===================================
}
