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
import { NzMessageService } from 'ng-zorro-antd/message'; // <-- [新增] 用於顯示訊息
import { NzModalService } from 'ng-zorro-antd/modal'; // <-- [新增] 用於顯示確認對話框
// --- [新增] 匯入這兩個必要的 NG-ZORRO 模組 ---
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button'; // 取消訂單按鈕也需要

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTableModule,

        NzSpinModule,
        NzEmptyModule,
        NzMessageModule, // <-- [新增]
        NzModalModule,   // <-- [新增]
        NzButtonModule   // <-- [新增]
    ],
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css'],


})
export class OrderHistoryComponent implements OnInit, OnDestroy {
    // [修改] 將 orders 的型別改為基於 OrderHistoryDto
    //orders: (OrderHistoryDto & { expand: boolean })[] = [];

    orders: OrderHistoryDto[] = [];
    isLoading = true;
    isLoggedIn = true;

    // --- [新增] 用於控制自訂對話框的屬性 ---
    isCancelModalVisible = false;
    orderToCancel: OrderHistoryDto | null = null;


    private authSubscription!: Subscription; // <--- 用於儲存訂閱

    constructor(private orderService: OrderService,
        private authService: AuthService, // <--- 注入 AuthService
        private message: NzMessageService, // <-- [新增]
      //  private modal: NzModalService     // <-- [新增]
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


    // --- [新增] 請將以下整個函式複製並貼到這裡 ---
    // cancelOrder(order: OrderHistoryDto): void {
    //     this.modal.confirm({
    //         nzTitle: '您確定要取消這筆訂單嗎？',
    //         nzContent: `訂單編號：${order.orderId}`,
    //         nzCentered: true, // <-- [新增] 將這個屬性設為 true
    //         nzOkText: '確定取消',
    //         nzOkType: 'primary',
    //         nzOkDanger: true,
    //         nzOnOk: () => {
    //             this.orderService.cancelOrder(order.orderId).subscribe({
    //                 next: () => {
    //                     // 在前端即時更新狀態，提供立即反饋
    //                     //order.status = '已取消';

    //                     // [核心修改] 使用 .map 產生一個新陣列來更新畫面
    //                     this.orders = this.orders.map(o => {
    //                         if (o.orderId === order.orderId) {
    //                             // 如果是我們剛剛取消的那筆訂單，就回傳一個已更新狀態的新物件
    //                             return { ...o, status: '已取消' };
    //                         }
    //                         // 其他訂單則維持原樣
    //                         return o;
    //                     });
    //                     this.message.success('訂單已成功取消');
    //                 },
    //                 error: (err) => {
    //                     console.error('取消訂單失敗:', err);
    //                     this.message.error('取消訂單時發生錯誤');
    //                 }
    //             });
    //         },
    //         nzCancelText: '返回',
    //         // [修正] 新增 nzOnCancel 屬性，處理用戶點擊「返回」或右上角「X」的行為
    //         nzOnCancel: () => {
    //             // 這個函式可以是空的，它的存在就會讓對話框在取消時正常關閉。
    //             // 您也可以在此加入一些邏輯，例如 console.log('使用者取消了操作');
    //         }
    //     });
    // }

     // --- [修改] cancelOrder 函式，不再呼叫 modal.confirm ---
    cancelOrder(order: OrderHistoryDto): void {
        // 只需打開對話框並記住要取消哪個訂單
        this.orderToCancel = order;
        this.isCancelModalVisible = true;
    }

    // --- [新增] 關閉對話框的函式 ---
    closeModal(): void {
        this.isCancelModalVisible = false;
        this.orderToCancel = null;
    }

    // --- [新增] 使用者點擊「確定取消」後執行的函式 ---
    confirmCancellation(): void {
        if (!this.orderToCancel) {
            return;
        }

        // 把原本 nzOnOk 裡面的邏輯搬到這裡
        this.orderService.cancelOrder(this.orderToCancel.orderId).subscribe({
            next: () => {
                this.orders = this.orders.map(o => {
                    if (this.orderToCancel && o.orderId === this.orderToCancel.orderId) {
                        return { ...o, status: '已取消' };
                    }
                    return o;
                });
                this.message.success('訂單已成功取消');
                this.closeModal(); // 成功後關閉對話框
            },
            error: (err) => {
                console.error('取消訂單失敗:', err);
                this.message.error('取消訂單時發生錯誤');
                this.closeModal(); // 發生錯誤也關閉對話框
            }
        });
    }



}
