import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { EbookCartItemDto } from 'app/features/ebook/DTOs/ebook-cart-item.dto';
import { EbookService } from 'app/features/ebook/services/ebook.service';
import { OrderService } from 'app/features/ebook/services/order.service'; // <-- [新增] 匯入 OrderService

import { CreateOrderRequestDto } from 'app/features/used-book/dtos/create-order-request.dto';
import { LookupService } from 'app/features/used-book/services/lookup.service';
import { UsedBookOrderService } from 'app/features/used-book/services/used-book-order.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { Me } from 'app/shared/auth/auth.types';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';
import { CartDto } from 'app/shared/dtos/cart.dto';
import { CheckoutDraftDto } from 'app/shared/dtos/checkout-draft.dto';
import { CartService } from 'app/shared/services/cart.service';
import { ToastService } from 'app/shared/services/toast.service';
import { deliveryToRepr } from 'app/shared/types/delivery-option';
import { paymentToRepr } from 'app/shared/types/payment-option';
import { providerToRepr } from 'app/shared/types/product-provider';
import { take, tap, switchMap, forkJoin, map, catchError, EMPTY, Observable } from 'rxjs';




@Component({
    selector: 'app-sh-checkout-review-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-review-page.component.html',
    styleUrl: './checkout-review-page.component.css'
})
export class CheckoutReviewPageComponent {
    private readonly router = inject(Router);
    private readonly cartSvc = inject(CartService);
    private readonly cartSidebarApi = inject(CartSidebarApi);
    private readonly lookupSvc = inject(LookupService);
    private readonly document = inject(DOCUMENT);
    private readonly toastSvc = inject(ToastService);
    private readonly usedBookOrderSvc = inject(UsedBookOrderService);

    private readonly orderSvc = inject(OrderService); // [新增] 注入 EbookService
    private readonly ebookSvc = inject(EbookService); // [新增] 注入 EbookService

    private readonly authSvc = inject(AuthService);
    me$: Observable<Me | null> = this.authSvc.user$;


    readonly providerToRepr = providerToRepr;
    readonly paymentToRepr = paymentToRepr;
    readonly deliveryToRepr = deliveryToRepr;

    // 資料物件
    draft = signal<CheckoutDraftDto | undefined>(undefined);
    cart = signal<CartDto | undefined>(undefined);

    // ========== 核心函數 ==========

    onEBookOrderSubmit() {
        console.log(this.draft());
        console.log(this.cart());
        if (!this.draft()?.buyerId) {
            alert("請先登入!");
            this.router.navigate(["/login"]);
        } else {
            // [修改] 填入 EBook 結帳邏輯
            if (!this.cart()) {
                console.error("購物車為空，無法建立訂單");
                return;
            }

            // 1. 將前端的購物車項目，轉換成後端 API 需要的格式
            const requestBody: EbookCartItemDto[] = this.cart()!.items.map(item => ({
                ebookId: Number(item.id), // CartDto 的 id 是 string，需轉為 number
                quantity: item.quantity
            }));


            // 2. 取得使用者選擇的付款方式
            const paymentOption = this.draft()?.paymentOption;

            // 3. 呼叫 OrderService 來建立待付款訂單
            this.orderSvc.createOrder(requestBody).pipe(
                switchMap(orderResponse => {
                    console.log('待付款訂單建立成功，訂單 ID:', orderResponse.orderId);
                    const orderId = orderResponse.orderId;

                    // 4. [核心修改] 根據不同的付款方式，執行不同的後續操作
                    switch (paymentOption) {
                        case 'LINEPay':
                            // 如果是 LINE Pay，呼叫 LINE Pay 的 API
                            return this.ebookSvc.requestLinePay(orderResponse.orderId);

                        case 'TransferAndATM':
                            // TODO: 串接銀行轉帳/ATM的後端API
                            // 假設您有一個用於處理銀行轉帳的 service 方法
                            console.log('使用者選擇銀行轉帳/ATM，準備導向至轉帳資訊頁面...');
                            // 例如：this.router.navigate(['/checkout/bank-info', orderResponse.orderId]);
                            // 暫時先跳轉到成功頁面或顯示提示
                            // alert('銀行轉帳功能尚未開放！');
                            // 導航路徑不變，因為它是由路由設定檔決定的
                            // [修改] 恢復原有的導航邏輯，將 orderId 透過路由參數傳遞
                            console.log('使用者選擇銀行轉帳/ATM，導向至轉帳資訊頁面...');
                            this.router.navigate(['/ebook/checkout/confirm', { orderId: orderId, paymentType: 'ATM' }]);
                            // 使用 EMPTY 中斷後續的 subscribe 流程，因為頁面即將跳轉
                            return EMPTY;

                        case 'CreditCard':
                            // TODO: 串接信用卡的後端API (例如：ECPay, NewebPay)
                            // 假設您有一個用於處理信用卡支付的 service 方法
                            // 呼叫 OrderService 中的 ECPay 信用卡方法
                            return this.orderSvc.requestEcpayCreditCardPayment(orderId);

                        default:
                            console.error(`未知的付款方式: ${paymentOption}`);
                            alert(`發生錯誤：不支援的付款方式 ${paymentOption}`);
                            return EMPTY;
                    }
                })
            ).subscribe({
                next: (paymentResponse) => {
                    // 這個 next 只會在 LINE Pay 的情況下被觸發 (因為其他選項回傳 EMPTY)
                    if (
                        paymentResponse &&
                        typeof paymentResponse !== 'string' &&
                        paymentResponse.info?.paymentUrl?.web
                    ) {
                        // 成功取得 LINE Pay 付款網址，跳轉
                        this.document.location.href = paymentResponse.info.paymentUrl.web;
                    } else if (paymentResponse) {
                        // 處理其他付款方式成功後的回應 (如果它們不回傳 EMPTY)
                        console.log('付款請求已成功送出', paymentResponse);
                    }
                },
                error: (err) => {
                    console.error("[onEBookOrderSubmit] 整個結帳流程發生錯誤", err);
                }
            });
        }

    }





    onFundOrderSubmit() {
        console.log(this.draft());
        console.log(this.cart());
        if (!this.draft()?.buyerId) {
            alert("請先登入!");
            this.router.navigate(["/login"]);
        }
    }

    onUsedBookOrderSubmit() {
        const req: CreateOrderRequestDto = {
            paymentMethod: this.draft()?.paymentOption ?? 'FaceToFace',
            deilveryMethod: this.draft()?.deliveryOption ?? 'FaceToFace',
            bookIdList: this.cart()!.items.map(i => i.id),
        };
        this.toastSvc.info("訂單處理中...");
        this.usedBookOrderSvc.createOrder(req).subscribe({
            next: (res) => {
                this.cartSidebarApi.clear();
                this.document.location.href = res.url;
            },
            error: (err) => console.error("[onUsedBookOrderSubmit] 新增訂單錯誤", err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.cartSvc.getCheckoutDraft().pipe(
            take(1),
            switchMap(draft => {
                // HACK:
                if (draft.productProvider === 'UsedBook' && draft.deliveryOption === 'FaceToFace') {
                    draft.countyId = 1;
                    draft.districtId = 1;
                }

                const isEBook = draft.productProvider === 'EBook';
                return isEBook
                    // --- 電子書僅需顯示購物車 ---
                    ? this.cartSvc.getCartByProvider(draft.productProvider).pipe(
                        map(cart => ({ draft, county: null as any, district: null as any, cart }))
                    )
                    // --- 其他子服務 ---
                    : forkJoin({
                        county: this.lookupSvc.getCountyById(draft.countyId),
                        district: this.lookupSvc.getDistrictById(draft.districtId),
                        cart: this.cartSvc.getCartByProvider(draft.productProvider),
                    }).pipe(
                        map(({ county, district, cart }) => ({ draft, county, district, cart }))
                    );
            }),
            tap(({ draft, county, district, cart }) => {
                if (county && district) {
                    const fullAddress = county.name + district.name + draft.address;
                    this.draft.set({ ...draft, fullAddress });
                } else {
                    this.draft.set(draft);
                }
                if (cart) this.cart.set(cart);
            }),
            switchMap(me => this.me$),
            tap(me =>
                this.draft.update(d => d
                    ? { ...d, buyerId: me?.uid ?? null }
                    : d
                )
            ),
            catchError(err => {
                console.error('[ngOnInit] 取得結帳草稿失敗', err);
                return EMPTY;
            })
        ).subscribe();
    }

    onSubmit() {
        switch (this.draft()?.productProvider) {
            case 'EBook': {
                this.onEBookOrderSubmit();
                break;
            }
            case 'Fund': {
                this.onFundOrderSubmit();
                break;
            }
            case 'UsedBook': {
                this.onUsedBookOrderSubmit();
                break;
            }
            default: {
                console.error("[onSubmit] 取得結帳草稿失敗");
                break;
            }
        };
    }

    // ========== 工具函數 ==========

    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
