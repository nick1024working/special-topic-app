import { ProductProvider } from './../../types/product-provider';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IdNameDto } from 'app/features/used-book/dtos/id-name.dto';
import { LookupService } from 'app/features/used-book/services/lookup.service';
import { CartDto } from 'app/shared/dtos/cart.dto';
import { CartService } from 'app/shared/services/cart.service';
import { DeliveryOption, deliveryToDesc, deliveryToRepr } from 'app/shared/types/delivery-option';
import { PaymentOption, paymentToRepr, paymentToDesc } from 'app/shared/types/payment-option';
import { switchMap, take, tap } from 'rxjs';

@Component({
    selector: 'app-sh-checkout-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-page.component.html',
    styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent {

    private readonly _cartSvc = inject(CartService);
    private readonly _lookupSvc = inject(LookupService);
    private readonly _router = inject(Router);

    readonly paymentToRepr = paymentToRepr;
    readonly paymentToDesc = paymentToDesc;
    readonly deliveryToRepr = deliveryToRepr;
    readonly deliveryToDesc = deliveryToDesc;

    // 資料物件
    provider!: ProductProvider;
    deliveryOpt!: DeliveryOption;
    paymentOpt!: PaymentOption;
    cart!: CartDto;
    // user:

    // UI使用
    isAllDataValid: boolean = false;
    countyList = signal<IdNameDto[] | undefined>(undefined);
    districtList = signal<IdNameDto[] | undefined>(undefined);

    // 資料欄位
    name: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    county: string | undefined;
    district: string | undefined;
    address: string | undefined;

    // ========== 核心函數 ==========

    private validate(): boolean {
        return true;
    }


    // ========== HOOK ==========

    ngOnInit(): void {

        this._lookupSvc.GetCountyList().subscribe({
            next: (res) => this.countyList.set(res),
            error: (err) => console.error("[ngOnInit] 取得縣市清單失敗", err),
        });

        this._cartSvc.getCheckoutDraft().pipe(
            take(1),
            tap(draft => {
                this.provider = draft.productProvider;
                this.deliveryOpt = draft.deliveryOption;
                this.paymentOpt = draft.paymentOption;
            }),
            switchMap(draft => this._cartSvc.getCartByProvider(draft.productProvider)),
            tap(cart => this.cart = cart),
            tap(() => this.isAllDataValid = true),
        )
            .subscribe({
                error: (err) => console.error("[ngOnInit] 取得結帳草稿失敗", err),
            });

    }

    // ========== 事件 ==========

    onCountySelect(countyId: string | null) {
        const id = countyId ? Number(countyId) : null;
        if (!id) {
            console.error("[onCountySelect] 取得鄉鎮市區 id 失敗");
            return;
        }
        this._lookupSvc.GetDistrictListByCountyId(id).subscribe({
            next: (res) => this.districtList.set(res),
            error: (err) => console.error("[onCountySelect] 取得鄉鎮市區清單失敗", err),
        });
    }

    onSubmit() {
        // 驗證
        if (!this.validate())
            return;

        // 呼叫
        switch (this.provider) {
            case 'EBook': {
                break;
            }
            case 'Fund': {
                break;
            }
            case 'UsedBook': {

                break;
            }
        }
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
