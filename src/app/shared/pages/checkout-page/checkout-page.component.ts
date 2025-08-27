import { ProductProvider } from './../../types/product-provider';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartDto } from 'app/shared/dtos/cart.dto';
import { CartService } from 'app/shared/services/cart.service';
import { DeliveryOption } from 'app/shared/types/delivery-option';
import { PaymentOption } from 'app/shared/types/payment-option';

@Component({
    selector: 'app-sh-checkout-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-page.component.html',
    styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent {
    private readonly _cartSvc = inject(CartService);
    private readonly _router = inject(Router);

    @Input() provider: ProductProvider | undefined;
    @Input() deliveryOpt: DeliveryOption | undefined;
    @Input() paymentOpt: PaymentOption | undefined;

    // 資料物件
    cart: CartDto | undefined;

    // ========== HOOK ==========

    ngOnInit(): void {
        const navState = this._router.getCurrentNavigation()?.extras.state as Partial<CheckoutPageComponent> | undefined
            ?? (history.state as Partial<CheckoutPageComponent> | undefined);

        if (navState) {
            this.provider ??= navState.provider!;
            this.deliveryOpt ??= navState.deliveryOpt!;
            this.paymentOpt ??= navState.paymentOpt!;
        }

        if (!this.provider) {
            console.error("[ngOnInit] 並未提供 provider");
            return;
        }
        this._cartSvc.getCartByProvider(this.provider).subscribe({
            next: (res) => {
                this.cart = res;
                console.log("CheckoutPageComponent");
                console.log(this.cart);
                console.log(this.provider);
                console.log(this.deliveryOpt);
                console.log(this.paymentOpt);
            },
            // next: (res) => this.cart = res,
            error: (err) => console.error("[ngOnInit] 取得 cart 失敗", err),
        });
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
