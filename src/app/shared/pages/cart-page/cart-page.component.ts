import { CartItemDto } from 'app/shared/dtos/cart-item.dto';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AllCartsDto } from 'app/shared/dtos/all-carts.dto';
import { ProductProvider, providerToRepr, typedEntries } from 'app/shared/types/product-provider';
import { CartService } from 'app/shared/services/cart.service';
import { FormsModule } from '@angular/forms';
import { TopContentApi } from 'app/shared/components/top-content/top-content.api';
import { PaymentOption, paymentRepr, PAYMENTS } from 'app/shared/types/payment-option';
import { DELIVERIES, DeliveryOption, deliveryRepr } from 'app/shared/types/delivery-option';

@Component({
    selector: 'app-sh-cart-page',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './cart-page.component.html',
    styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
    private readonly _cartSvc = inject(CartService);
    private readonly _topContentApi = inject(TopContentApi);
    private readonly _router = inject(Router);
    readonly providerToRepr = providerToRepr;

    readonly payments = PAYMENTS;
    readonly paymentRepr = paymentRepr;
    readonly deliveries = DELIVERIES;
    readonly deliveryRepr = deliveryRepr;

    // 資料物件
    allCarts = signal<AllCartsDto | undefined>(undefined);
    cartEntries = computed(() =>
        this.allCarts()
            ? typedEntries(this.allCarts()!.carts)
                .filter(([_, cart]) => cart.items.length > 0)
                .map(([provider, cart]) => ({
                    provider,
                    cart: cart!,
                    selectedDelivery: (provider === 'EBook' ? 'NoDelivery' : 'HomeDeliveryHCT') as DeliveryOption,
                    selectedPayment: 'LINEPay' as PaymentOption,
                }))
            : []
    );


    // ========== 核心函數 ==========

    /** 從後端取回全部購物車資料，並更新資料物件 */
    pushCarts() {
        this._cartSvc.getCart().subscribe({
            next: res => {
                this.allCarts.set(res);
                this._topContentApi.cartItemCount(this.cartEntries().reduce((acc, curr) =>
                    acc + curr.cart.items.reduce((acc, curr) => acc + curr.quantity, 0), 0));
            },
            error: err => console.error("[pushCarts] 無法取得所有購物車", err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.pushCarts();
    }

    // ========== 事件 ==========

    removeItem(provider: ProductProvider | undefined, id: string) {
        if (provider === undefined) return;
        this._cartSvc.removeItem(provider, id).subscribe({
            next: () => this.pushCarts(),
            error: err => console.error("[removeItem] 從購物車移除商品失敗", err),
        });
    }

    clearCart() {
        this._cartSvc.clearCart().subscribe({
            next: () => this.pushCarts(),
            error: err => console.error("[clearCart] 清空購物車失敗", err),
        });
    }

    onQtyDecrease(provider: ProductProvider, item: CartItemDto) {
        console.log(provider);
        console.log(item);
        if (item.quantity <= 1) {
            this._cartSvc.removeItem(provider, item.id).subscribe({
                next: () => this.pushCarts()
            });
        }
        else {
            this.upsertAndPush(provider, item.id, item.quantity - 1);
        }
    }

    onQtyIncrease(provider: ProductProvider, item: CartItemDto) {
        console.log(provider);
        console.log(item);
        this.upsertAndPush(provider, item.id, item.quantity + 1);
    }

    onDeliverySelect(provider: ProductProvider, fee: DeliveryOption) {
    }

    onCheckOut(provider: ProductProvider, deliveryOpt: DeliveryOption, paymentOpt: PaymentOption) {
        console.log("onCheckOut");
        console.log(provider);
        console.log(deliveryOpt);
        console.log(paymentOpt);
        this._router.navigate(['/checkout'], { state: { provider, deliveryOpt, paymentOpt } });
    }

    // ========== 工具函數 ==========

    private upsertAndPush(productProvider: ProductProvider, id: string, quantity: number) {
        this._cartSvc.upsertItem({ productProvider, id, quantity }).subscribe({
            next: () => this.pushCarts()
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
