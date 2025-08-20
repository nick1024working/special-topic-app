// src/app/features/ebook/services/order.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrderDto } from '../DTOs/order.dto';

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    constructor() { }

    // 取得所有訂單的方法
    getOrders(): Observable<OrderDto[]> {
        // --- 這是未來的 API 呼叫 ---
        // return this.http.get<OrderDto[]>('/api/orders');

        // --- 目前先回傳假資料 ---
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
                        price: 499, // 特價
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/chip-war.jpg'
                    },
                    {
                        ebookId: 306,
                        ebookName: '台北人',
                        price: 199, // 特價
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/taipei-people.jpg'
                    },
                    {
                        ebookId: 308,
                        ebookName: '解憂雜貨店',
                        price: 280, // 特價
                        quantity: 2, // 購買兩本
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
                        price: 399, // 特價
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/mockingbird.jpg'
                    },
                    {
                        ebookId: 315,
                        ebookName: 'The Lord of the Rings',
                        price: 799, // 特價
                        quantity: 1,
                        primaryCoverPath: '/assets/images/ebooks/lotr.gif' // 測試 .gif 圖片
                    }
                ]
            }
        ];

        // 使用 of() 將假資料轉為 Observable，並延遲 300 毫秒，模擬網路延遲
        return of(fakeOrders).pipe(delay(300));
    }
}
