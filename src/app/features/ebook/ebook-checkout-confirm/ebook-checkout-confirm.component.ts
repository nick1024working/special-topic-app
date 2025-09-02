import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'app/shared/services/cart.service';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-ebook-checkout-confirm',
    standalone: true,
    imports: [CommonModule,
        NzSpinModule,
        NzIconModule
    ],
    templateUrl: './ebook-checkout-confirm.component.html',
    styleUrl: './ebook-checkout-confirm.component.css'
})
export class EbookCheckoutConfirmComponent {
    // 使用 inject 注入需要的服務
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly cartSvc = inject(CartService);
    private readonly cartSidebarApi = inject(CartSidebarApi);

    // 用於控制畫面上顯示的狀態
    status: 'loading' | 'success' | 'error' = 'loading';
    message = '正在確認您的付款，請稍候...';

    ngOnInit(): void {
        // 1. 從 LINE Pay 回傳的網址中取得交易資訊
        const transactionId = this.route.snapshot.queryParamMap.get('transactionId');
        const orderId = this.route.snapshot.queryParamMap.get('orderId');

        if (transactionId && orderId) {
            // 2. 呼叫後端 API 進行最終確認
            const apiUrl = `https://localhost:7104/api/ebooks/line-pay/confirm?transactionId=${transactionId}&orderId=${orderId}`;

            this.http.post(apiUrl, {}, { withCredentials: true }).subscribe({
                next: (response: any) => {
                    // 3. 根據後端回應，導向到最終頁面
                    if (response.returnCode === '0000') {
                        this.status = 'success';
                        this.message = '付款成功！感謝您的購買，3秒後將導向至您的書櫃...';
                        // 付款成功後，清空前端購物車
                        this.cartSvc.clearCart().subscribe(() => this.cartSidebarApi.clear());
                        setTimeout(() => this.router.navigate(['/ebook/library']), 3000);
                    } else {
                        this.status = 'error';
                        this.message = `付款失敗: ${response.returnMessage}。3秒後將導向至您的訂單記錄...`;
                        setTimeout(() => this.router.navigate(['/member/order-history']), 3000);
                    }
                },
                error: err => {
                    this.status = 'error';
                    this.message = '確認付款時發生無法預期的錯誤，請聯繫客服人員。';
                    console.error(err);
                }
            });
        } else {
            this.status = 'error';
            this.message = '付款確認失敗，缺少必要的交易資訊。';
        }
    }

}
