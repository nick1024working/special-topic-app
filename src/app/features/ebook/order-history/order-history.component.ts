// src/app/features/ebook/order-history/order-history.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { OrderDto } from '../DTOs/order.dto';
import { OrderService } from '../services/order.service'; // [修改]
import { OrderHistoryDto } from '../DTOs/order-history.dto'; // [修改]
import { HttpErrorResponse } from '@angular/common/http'; // [新增]
import { NzEmptyModule } from 'ng-zorro-antd/empty'; // [新增]


@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTableModule,

        NzSpinModule,
        NzEmptyModule
    ],
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    // [修改] 將 orders 的型別改為基於 OrderHistoryDto
    orders: (OrderHistoryDto & { expand: boolean })[] = [];
    isLoading = true;
    isLoggedIn = true;

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.orderService.getOrders().subscribe({
            next: (data) => {
                // [關鍵修正] 使用 map 方法將後端回傳的 data 轉換成元件需要的格式
                this.orders = data.map(order => ({
                    ...order,       // 複製 order 物件的所有屬性
                    expand: false   // 為每個 order 物件新增 expand 屬性並設為 false
                }));
                this.isLoading = false;
                this.isLoggedIn = true;
            },
            error: (err: HttpErrorResponse) => {
                if (err.status === 401) {
                    this.isLoggedIn = false; // 未登入
                }
                console.error('載入訂單失敗:', err);
                this.isLoading = false;
            }
        });
    }
}
