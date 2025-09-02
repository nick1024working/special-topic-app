// src/app/features/ebook/order-history/order-history.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AuthService } from 'app/shared/auth/auth.service';

import { Subscription } from 'rxjs'; // <-- [新增] 請加入這一行

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
export class OrderHistoryComponent implements OnInit, OnDestroy {
    // [修改] 將 orders 的型別改為基於 OrderHistoryDto
    //orders: (OrderHistoryDto & { expand: boolean })[] = [];

    orders: OrderHistoryDto[] = [];
    isLoading = true;
    isLoggedIn = true;

    private authSubscription!: Subscription; // <--- 用於儲存訂閱

    constructor(private orderService: OrderService,
        private authService: AuthService // <--- 注入 AuthService
    ) { }

    ngOnInit(): void {
        // this.isLoading = true;
        // this.orderService.getOrders().subscribe({
        //     next: (data) => {
        //         // [關鍵修正] 使用 map 方法將後端回傳的 data 轉換成元件需要的格式
        //         this.orders = data.map(order => ({
        //             ...order,       // 複製 order 物件的所有屬性
        //             expand: false   // 為每個 order 物件新增 expand 屬性並設為 false
        //         }));
        //         this.isLoading = false;
        //         this.isLoggedIn = true;
        //     },
        //     error: (err: HttpErrorResponse) => {
        //         if (err.status === 401) {
        //             this.isLoggedIn = false; // 未登入
        //         }
        //         console.error('載入訂單失敗:', err);
        //         this.isLoading = false;
        //     }
        // });
        // [核心修改] 訂閱 authService 的 user$
        this.authSubscription = this.authService.user$.subscribe(user => {
            if (user) {
                // 如果 user 物件存在，代表已登入
                this.isLoggedIn = true;
                this.loadOrders(); // 載入訂單資料
            } else {
                // 如果 user 物件為 null，代表已登出
                this.isLoggedIn = false;
                this.isLoading = false;
                this.orders = []; // 清空已顯示的訂單資料
            }
        });

    }


    // 將原本 ngOnInit 的邏輯移到一個獨立的方法中
    loadOrders(): void {
        this.isLoading = true;
        this.orderService.getOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('載入訂單失敗:', err);
                this.isLoading = false;
                this.isLoggedIn = false; // 發生錯誤也視為未登入狀態
            }
        });
    }

    ngOnDestroy(): void {
        // 在元件銷毀時，取消訂閱，避免記憶體洩漏
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }



}
