import { CartItemDto } from 'app/shared/dtos/cart-item.dto';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AllCartsDto } from 'app/shared/dtos/all-carts.dto';
import { ProductProvider, providerToRepr, typedEntries } from 'app/shared/types/product-provider';
import { CartService } from 'app/shared/services/cart.service';
import { FormsModule } from '@angular/forms';
import { TopContentApi } from 'app/shared/components/top-content/top-content.api';

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

export const PAYMENTS = ['LINEPay', 'TransferAndATM', 'CreditCard', 'FaceToFace'] as const;
export type PaymentOption = typeof PAYMENTS[number];
export const paymentRepr: Record<PaymentOption, string> = {
    'LINEPay': 'LINE Pay',
    'TransferAndATM': '銀行轉帳/ATM',
    'CreditCard': '信用卡',
    'FaceToFace': '面交',
}

export const DELIVERIES = ['HomeDeliveryHCT', '711PickupPay', '711PickupOnly', 'FaceToFace', 'NoDelivery'] as const;
export type DeliveryOption = typeof DELIVERIES[number];
export const deliveryRepr: Record<DeliveryOption, string> = {
    'HomeDeliveryHCT': '宅配-新竹物流',
    '711PickupPay': '7-11 取貨付款',
    '711PickupOnly': '7-11 取貨不付款',
    'FaceToFace': '面交',
    'NoDelivery': '不須送貨',
}
