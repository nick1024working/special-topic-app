// 檔案路徑: src/app/features/ebook/cart-page/cart-page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // [新增] 匯入 Subscription

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { CartService } from '../services/cart.service'; // [新增] 匯入 CartService
import { CartItemDto } from '../DTOs/cart-item.dto';   // [新增] 匯入 CartItemDto
import { RouterModule } from '@angular/router';

import { Router } from '@angular/router'; // [新增]
import { NzMessageService } from 'ng-zorro-antd/message'; // [新增]
import { OrderService } from '../services/order.service'; // [新增]


@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule, FormsModule, NzTableModule, NzDividerModule, NzGridModule,
        NzStatisticModule, NzButtonModule, NzIconModule, NzInputNumberModule, RouterModule, // [新增] 將 RouterModule 加入到 imports 陣列
    ],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit, OnDestroy { // [修改] 實作 OnDestroy

    cartItems: CartItemDto[] = []; // [修改] 移除假資料，改為空陣列
    totalAmount = 0;
    private cartSubscription!: Subscription; // [新增] 用於儲存訂閱，方便銷毀

    // [修改] 注入 OrderService, Router 和 NzMessageService
    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private router: Router,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        // [修改] 訂閱 cartService 中的購物車項目
        this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
            this.cartItems = items;
            this.calculateTotal();
        });
    }

    // [新增] 在元件銷毀時，取消訂閱，避免記憶體洩漏
    ngOnDestroy(): void {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }

    // [新增] 處理結帳的函式
    checkout(): void {
        if (this.cartItems.length === 0) {
            this.message.warning('您的購物車是空的！');
            return;
        }

        // 呼叫 OrderService 的 createOrder 方法
        this.orderService.createOrder(this.cartItems).subscribe({
            next: (response) => {
                this.message.success(`訂單 #${response.orderId} 已成功建立！`);
                this.cartService.clearCart(); // 清空購物車
                this.router.navigate(['/member/order-history']); // 導向到訂單歷史頁面
            },
            error: (err) => {
                console.error('建立訂單失敗:', err);
                this.message.error('建立訂單時發生錯誤，請稍後再試。');
            }
        });
    }

    // 計算總金額 (此方法現在由訂閱觸發)
    calculateTotal(): void {
        this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // [新增] 當數量變更時，通知 service
    onQuantityChange(item: CartItemDto): void {
        if (item.quantity >= 1) {
            this.cartService.updateItemQuantity(item.ebookId, item.quantity);
        }
    }

    // [新增] 當點擊移除時，通知 service
    onRemoveItem(ebookId: number): void {
        this.cartService.removeItem(ebookId);
    }
}
