import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, BankTransferDetails } from 'app/features/ebook/services/order.service'; // 請確認 OrderService 的實際路徑
import { Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common'; // [新增] 匯入 AsyncPipe

// 定義轉帳資訊的結構 (與之前相同)
// export interface BankTransferDetails {
//     orderId: string;
//     bankName: string;
//     bankCode: string;
//     accountNumber: string;
//     amount: number;
//     paymentDeadline: string;
// }

@Component({
    selector: 'app-bank-transfer-info-page',
    standalone: true,
    // [修改] 加入 RouterLink 和 AsyncPipe
    imports: [RouterLink, AsyncPipe],
    templateUrl: './bank-transfer-info-page.component.html',
    styleUrl: './bank-transfer-info-page.component.css'
})
export class BankTransferInfoPageComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly orderSvc = inject(OrderService);

    transferDetails$?: Observable<BankTransferDetails | undefined>;

    ngOnInit(): void {
        this.transferDetails$ = this.route.paramMap.pipe(
            switchMap(params => {
                const orderId = params.get('orderId');
                if (!orderId) {
                    console.error('在路由中找不到 orderId');
                    return Promise.resolve(undefined);
                }

                // --- 以下為暫時的模擬資料 ---
                // TODO: 未來您需要實作 orderSvc.getBankTransferDetails(orderId) 來取代這段
                // return Promise.resolve({
                //     orderId: orderId,
                //     bankName: 'ProBook 銀行',
                //     bankCode: '822',
                //     accountNumber: `98765${orderId.slice(-6)}`,
                //     amount: 555,
                //     paymentDeadline: '2025-09-05 23:59:59'
                // });
                // --- 模擬資料結束 ---

                // ========== [TODO] 的實作 ==========
                // 移除模擬資料，改為真正呼叫 Service
                return this.orderSvc.getBankTransferDetails(orderId);
                // ===================================
            })
        );
    }
}
