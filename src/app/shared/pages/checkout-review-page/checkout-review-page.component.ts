import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LookupService } from 'app/features/used-book/services/lookup.service';
import { CartDto } from 'app/shared/dtos/cart.dto';
import { CheckoutDraftDto } from 'app/shared/dtos/checkout-draft.dto';
import { CartService } from 'app/shared/services/cart.service';
import { deliveryToRepr } from 'app/shared/types/delivery-option';
import { paymentToRepr } from 'app/shared/types/payment-option';
import { providerToRepr } from 'app/shared/types/product-provider';
import { take, tap, switchMap } from 'rxjs';

@Component({
    selector: 'app-sh-checkout-review-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-review-page.component.html',
    styleUrl: './checkout-review-page.component.css'
})
export class CheckoutReviewPageComponent {
    private readonly cartSvc = inject(CartService);
    private readonly lookupSvc = inject(LookupService);
    private readonly router = inject(Router);

    readonly providerToRepr = providerToRepr;
    readonly paymentToRepr = paymentToRepr;
    readonly deliveryToRepr = deliveryToRepr;

    // 資料物件
    draft = signal<CheckoutDraftDto | undefined>(undefined);
    cart = signal<CartDto | undefined>(undefined);

    // ========== 核心函數 ==========

    onEBookOrderSubmit() { }

    onFundOrderSubmit() { }

    onUsedBookOrderSubmit() {
        this.router.navigateByUrl("http://placehold.co");
    }

    // ========== HOOK ==========

    ngOnInit(): void {

        this.cartSvc.getCheckoutDraft()
            .pipe(
                take(1),
                tap(draft => this.draft.set(draft)),
                tap(() => this.draft()!.fullAddress = ""),
                switchMap(() => this.lookupSvc.getCountyById(this.draft()!.countyId)),
                tap(county => this.draft()!.fullAddress += county.name),
                switchMap(() => this.lookupSvc.getDistrictById(this.draft()!.districtId)),
                tap(district => this.draft()!.fullAddress += district.name),
                tap(() => this.draft()!.fullAddress += this.draft()!.address),
                switchMap(() => this.cartSvc.getCartByProvider(this.draft()!.productProvider)),
                tap(cart => this.cart.set(cart)),
            )
            .subscribe({
                error: (err) => console.error("[ngOnInit] 取得結帳草稿失敗", err),
            });
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
