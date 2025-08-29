import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderHistoryDto } from '../DTOs/order-history.dto';
import { CartItemDto } from '../DTOs/cart-item.dto';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'https://localhost:7104/api/EbookOrders';

    constructor(private http: HttpClient) { }

    // 取得驗證標頭 (確保與其他 service 的邏輯一致)
    private getAuthHeaders(): HttpHeaders {
        let token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            return new HttpHeaders().set('Authorization', 'Bearer ' + token);
        }
        return new HttpHeaders();
    }

    // [修改] 取得歷史訂單 (現在會呼叫後端 API)
    getOrders(): Observable<OrderHistoryDto[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<OrderHistoryDto[]>(this.apiUrl, { headers });
    }

    // [新增] 建立新訂單 (呼叫後端 API)
    createOrder(cartItems: CartItemDto[]): Observable<{ orderId: number }> {
        const headers = this.getAuthHeaders();
        return this.http.post<{ orderId: number }>(this.apiUrl, cartItems, { headers });
    }
}
