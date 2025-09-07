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
import { deliveryToRepr } from 'app/shared/types/delivery-option';
import { paymentToRepr } from 'app/shared/types/payment-option';
import { providerToRepr } from 'app/shared/types/product-provider';
import { take, tap, switchMap, forkJoin, map, catchError, EMPTY, Observable } from 'rxjs';

// 【錯誤修正 1】匯入 LinePayRequestResponseDto 型別
import { LinePayRequestResponseDto } from 'app/features/ebook/DTOs/line-pay-request-response.dto';


// 【新增】定義一個統一的回應型別，方便在 subscribe 中處理
type PaymentResponseType =
    { type: 'ECPay', payload: string, orderId: number } |
    { type: 'LINEPay', payload: LinePayRequestResponseDto, orderId: number };


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
    private readonly _usedBookOrderSvc = inject(UsedBookOrderService);

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
                            // // 如果是 LINE Pay，呼叫 LINE Pay 的 API
                            // return this.ebookSvc.requestLinePay(orderResponse.orderId);
                            // 【修改】將 LINE Pay 的回應也用 map 包裝起來，保持資料結構一致
                            return this.ebookSvc.requestLinePay(orderId).pipe(
                                map(linePayResponse => ({ type: 'LINEPay', payload: linePayResponse, orderId: orderId } as PaymentResponseType))
                            );

                        case 'TransferAndATM':
                            // 【修改】使用 map 將 orderId 和後端回傳的 HTML 一起傳遞下去
                            return this.orderSvc.createEcpayPayment(orderId).pipe(
                                map(htmlString => ({ type: 'ECPay', payload: htmlString, orderId: orderId } as PaymentResponseType))
                            );

                        case 'CreditCard':
                            // 【修改】使用 map 將 orderId 和後端回傳的 HTML 一起傳遞下去
                            return this.orderSvc.createEcpayPayment(orderId).pipe(
                                map(htmlString => ({ type: 'ECPay', payload: htmlString, orderId: orderId } as PaymentResponseType))
                            );

                        default:
                            console.error(`未知的付款方式: ${paymentOption}`);
                            alert(`發生錯誤：不支援的付款方式 ${paymentOption}`);
                            return EMPTY;
                    }
                })
            ).subscribe({
                next: (response: PaymentResponseType) => {
                    // 【錯誤修正 2】使用 if/else if 明確區分型別，讓 TypeScript 可以正確推斷
                    if (response.type === 'ECPay') {
                        
                        sessionStorage.setItem('ecpay_order_id', response.orderId.toString());
                        // 【關鍵修正】使用 iframe 進行表單提交
                        const iframe = this.document.createElement('iframe');
                        iframe.style.display = 'none'; // 隱藏 iframe
                        this.document.body.appendChild(iframe);

                        // 等待 iframe 完全載入
                        iframe.onload = () => {
                            // 將表單提交的目標設定為頂層視窗，以跳出 iframe
                            const form = iframe.contentWindow?.document.querySelector('form');
                            if (form) {
                                form.setAttribute('target', '_top');
                                form.submit();
                            }
                        };

                        // 將 HTML 寫入 iframe
                        iframe.contentWindow?.document.open();
                        iframe.contentWindow?.document.write(response.payload);
                        iframe.contentWindow?.document.close();
                    }
                    else if (response.type === 'LINEPay') {
                        const paymentUrl = response.payload.info?.paymentUrl?.web;
                        if (paymentUrl) {
                            console.log('接收到 LINE Pay 付款網址，準備跳轉...');
                            this.document.location.href = paymentUrl;
                        } else {
                            console.error('收到 LINE Pay 回應，但缺少付款網址', response.payload);
                            alert('無法取得 LINE Pay 付款連結，請稍後再試。');
                        }
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
        }
        this._usedBookOrderSvc.createOrder(req).subscribe({
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
