import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { CartService } from 'app/shared/services/cart.service';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';
import { OrderService, BankTransferDetails } from 'app/features/ebook/services/order.service';

@Component({
    selector: 'app-ebook-checkout-confirm',
    standalone: true,
    imports: [
        CommonModule,
        NzSpinModule,
        NzIconModule,
        NzDescriptionsModule,
        NzCardModule,
        NzResultModule,
        NzButtonModule
    ],
    templateUrl: './ebook-checkout-confirm.component.html',
    styleUrl: './ebook-checkout-confirm.component.css'
})
export class EbookCheckoutConfirmComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly cartSvc = inject(CartService);
    private readonly cartSidebarApi = inject(CartSidebarApi);
    private readonly orderSvc = inject(OrderService);

    // 新增 'atm-info' 和 'ecpay-result' 狀態
    status: 'loading' | 'success' | 'error' | 'atm-info' | 'ecpay-result' = 'loading';
    message = '正在處理您的請求，請稍候...';
    bankDetails: BankTransferDetails | null = null;
    orderId: string | null = null;

    ngOnInit(): void {

        const transactionId = this.route.snapshot.queryParamMap.get('transactionId');
        const queryOrderId = this.route.snapshot.queryParamMap.get('orderId'); // For LINE Pay
        const pathOrderId = this.route.snapshot.paramMap.get('orderId');     // For ATM and ECPay
        const paymentType = this.route.snapshot.paramMap.get('paymentType'); // Specifically for ATM

        if (transactionId && queryOrderId) {
            // 情境一：從 LINE Pay 付款後返回
            this.confirmLinePayPayment(transactionId, queryOrderId);
        } else if (pathOrderId && paymentType === 'ATM') {
            // 情境二：選擇 ATM 轉帳後導航至此
            this.fetchBankTransferDetails(pathOrderId);
        } else if (pathOrderId) {
            // 【最終修正 2】這個邏輯現在可以正確捕捉所有從 ECPay 返回的情境 (例如信用卡)
            this.displayEcpayResult(pathOrderId);
        } else {
            this.status = 'error';
            this.message = '處理失敗，缺少必要的訂單資訊。';
        }
    }

    confirmLinePayPayment(transactionId: string, orderId: string): void {
        // ... (此函式邏輯不變)
        this.status = 'loading';
        this.message = '正在確認您的 LINE Pay 付款...';
        const apiUrl = `https://localhost:7104/api/ebooks/line-pay/confirm?transactionId=${transactionId}&orderId=${orderId}`;
        this.http.post(apiUrl, {}, { withCredentials: true }).subscribe({
            next: (response: any) => {
                if (response.returnCode === '0000') {
                    this.status = 'success';
                    this.message = '付款成功！感謝您的購買，3秒後將導向至您的書櫃...';
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
    }

    fetchBankTransferDetails(orderId: string): void {
        this.status = 'loading';
        this.message = '正在取得轉帳資訊...';
        this.orderSvc.getBankTransferDetails(orderId).subscribe({
            next: (details) => {
                this.status = 'atm-info';
                this.bankDetails = details;
                this.message = '請依下列資訊完成轉帳，轉帳完成後，系統將自動更新您的訂單狀態。';
                this.cartSvc.clearCart().subscribe(() => this.cartSidebarApi.clear());
            },
            error: (err) => {
                this.status = 'error';
                this.message = '取得轉帳資訊失敗，請至訂單記錄頁面查詢。';
                console.error(err);
            }
        });
    }

    displayEcpayResult(orderId: string): void {
        this.status = 'ecpay-result';
        this.orderId = orderId;
        // 付款完成後，清空電子書的購物車

        this.cartSvc.clearCart().subscribe({
            next: () => this.cartSidebarApi.show(), // 通知側邊欄刷新
            error: (err) => console.error('清空購物車失敗', err)
        });
    }
}

