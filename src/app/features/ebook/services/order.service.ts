// src/app/features/ebook/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // [新增]
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators'; // [新增]
import { delay } from 'rxjs/operators';
import { OrderDto } from '../DTOs/order.dto';

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    // [新增] 後端 API 網址
    private apiUrl = 'https://localhost:7104/api/orders';

    // [新增] 注入 HttpClient
    constructor(private http: HttpClient) { }

    // 取得所有訂單的方法
    // [重大修改] 取得所有訂單的方法
    getOrders(): Observable<OrderDto[]> {

        // --- 先定義好前端的假資料 ---
        const fakeOrders: OrderDto[] = [
            {
                orderId: '20250820143015',
                orderDate: '2025/08/20 14:30:15',
                status: '已完成',
                totalAmount: 1228,
                items: [
                    {
                        ebookId: 303,
                        ebookName: '晶片戰爭',
                        price: 499,
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/chip-war.jpg'
                    },
                    {
                        ebookId: 306,
                        ebookName: '台北人',
                        price: 199,
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/taipei-people.jpg'
                    },
                    {
                        ebookId: 308,
                        ebookName: '解憂雜貨店',
                        price: 280,
                        quantity: 2,
                        primaryCoverPath: '/assets/images/ebooks/namiya.jpg'
                    }
                ]
            },
            {
                orderId: '20250819091544',
                orderDate: '2025/08/19 09:15:44',
                status: '處理中',
                totalAmount: 1198,
                items: [
                    {
                        ebookId: 310,
                        ebookName: 'To Kill a Mockingbird',
                        price: 399,
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/mockingbird.jpg'
                    },
                    {
                        ebookId: 315,
                        ebookName: 'The Lord of the Rings',
                        price: 799,
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/lotr.gif'
                    }
                ]
            }
        ];

        // --- 發送 API 請求並組合資料 ---
        return this.http.get<OrderDto[]>(`${this.apiUrl}/my-orders`).pipe(
            // 1. 如果成功，將後端資料和前端假資料合併
            map(backendOrders => {
                console.log("成功從後端載入訂單資料", backendOrders);
                // 使用展開語法 (...) 將兩個陣列合併
                return [...backendOrders, ...fakeOrders];
            }),
            // 2. 如果失敗，只回傳前端假資料
            catchError(error => {
                console.error('載入後端訂單失敗，僅顯示前端假資料:', error);
                // of() 會將一般陣列轉換成 Observable
                return of(fakeOrders);
            })
        );
    }
}
