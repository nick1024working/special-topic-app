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

            // // 2. 呼叫 EbookService 中的 createOrder 方法
            // this.ebookSvc.createOrder(requestBody).subscribe({
            //     next: (response) => {
            //         console.log('電子書訂單建立成功，訂單 ID:', response.orderId);
            //         // 3. 訂單成功後，清空購物車
            //         this.cartSvc.clearCart().subscribe({
            //             next: () => {
            //                 // 4. 將使用者導向到他們的書櫃頁面
            //                 this.cartSidebarApi.clear();
            //                 this.router.navigate(['/ebook/library']);
            //             },
            //             error: (err) => console.error("清空購物車失敗", err)
            //         });
            //     },
            //     error: (err) => {
            //         console.error("[onEBookOrderSubmit] 建立電子書訂單時發生錯誤", err);
            //         // 在此可以加入 UI 提示，告知使用者訂單建立失敗
            //     }
            // });

            // [核心修改]
            // 步驟 1: 先呼叫 OrderService 來建立待付款訂單
            this.orderSvc.createOrder(requestBody).pipe( // <-- 改用 orderSvc
                switchMap(orderResponse => {
                    console.log('待付款訂單建立成功，訂單 ID:', orderResponse.orderId);
                    // 步驟 2: 接著呼叫 EbookService 來請求 LINE Pay
                    return this.ebookSvc.requestLinePay(orderResponse.orderId);
                })
            ).subscribe({
                next: (linePayResponse) => {
                    if (linePayResponse && linePayResponse.info?.paymentUrl?.web) {
                        // 步驟 3: 成功取得付款網址，跳轉
                        this.document.location.href = linePayResponse.info.paymentUrl.web;
                    } else {
                        console.error("從後端取得的 LINE Pay 回應無效:", linePayResponse);
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
