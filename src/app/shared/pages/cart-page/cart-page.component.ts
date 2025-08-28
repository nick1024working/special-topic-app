import { CartItemDto } from 'app/shared/dtos/cart-item.dto';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AllCartsDto } from 'app/shared/dtos/all-carts.dto';
import { ProductProvider, providerToRepr, typedEntries } from 'app/shared/types/product-provider';
import { CartService } from 'app/shared/services/cart.service';
import { FormsModule } from '@angular/forms';
import { TopContentApi } from 'app/shared/components/top-content/top-content.api';
import { PaymentOption, PAYMENTS, paymentToDesc, paymentToRepr } from 'app/shared/types/payment-option';
import { DELIVERIES, deliveryFee, DeliveryOption, deliveryToDesc, deliveryToRepr } from 'app/shared/types/delivery-option';
import { CheckoutDraftDto } from 'app/shared/dtos/checkout-draft.dto';
import { UpdateDeliveryRequest } from 'app/shared/dtos/update-delivery-request.dto copy';

@Component({
    selector: 'app-sh-cart-page',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './cart-page.component.html',
    styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
    private readonly cartSvc = inject(CartService);
    private readonly topContentApi = inject(TopContentApi);
    private readonly router = inject(Router);

    readonly providerToRepr = providerToRepr;
    readonly payments = PAYMENTS;
    readonly paymentToRepr = paymentToRepr;
    readonly paymentToDesc = paymentToDesc;
    readonly deliveries = DELIVERIES;
    readonly deliveryToRepr = deliveryToRepr;
    readonly deliveryToDesc = deliveryToDesc;

    // 資料物件
    allCarts = signal<AllCartsDto | undefined>(undefined);
    cartEntries = computed(() =>
        this.allCarts()
            ? typedEntries(this.allCarts()!.carts)
                .filter(([_, cart]) => cart.items.length > 0)
                .map(([provider, cart]) => ({ provider, cart: cart! }))
            : []
    );
    cartOptions: Record<ProductProvider, { delivery: DeliveryOption; payment: PaymentOption }> = {
        EBook: { delivery: 'NoDelivery', payment: 'LINEPay' },
        Fund: { delivery: 'HomeDeliveryHCT', payment: 'CreditCard' },
        UsedBook: { delivery: 'FaceToFace', payment: 'LINEPay' }
    };

    // ========== 核心函數 ==========

    /** 從後端取回全部購物車資料，並更新資料物件 */
    private pushCarts() {
        this.cartSvc.getCart().subscribe({
            next: res => {
                this.allCarts.set(res);
                this.topContentApi.cartItemCount(this.cartEntries().reduce((acc, curr) =>
                    acc + curr.cart.items.reduce((acc, curr) => acc + curr.quantity, 0), 0));
            },
            error: err => console.error("[pushCarts] 無法取得所有購物車", err),
        });
    }

    private upsertAndPush(productProvider: ProductProvider, id: string, quantity: number) {
        this.cartSvc.upsertItem({ productProvider, id, quantity }).subscribe({
            next: () => this.pushCarts()
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.pushCarts();
    }

    // ========== 事件 ==========

    removeItem(provider: ProductProvider | undefined, id: string) {
        if (provider === undefined) return;
        this.cartSvc.removeItem(provider, id).subscribe({
            next: () => this.pushCarts(),
            error: err => console.error("[removeItem] 從購物車移除商品失敗", err),
        });
    }

    clearCart() {
        this.cartSvc.clearCart().subscribe({
            next: () => this.pushCarts(),
            error: err => console.error("[clearCart] 清空購物車失敗", err),
        });
    }

    onQtyDecrease(provider: ProductProvider, item: CartItemDto) {
        console.log(provider);
        console.log(item);
        if (item.quantity <= 1) {
            this.cartSvc.removeItem(provider, item.id).subscribe({
                next: () => this.pushCarts()
            });
        }
        else {
            this.upsertAndPush(provider, item.id, item.quantity - 1);
        }
    }

    onQtyIncrease(provider: ProductProvider, item: CartItemDto) {
        this.upsertAndPush(provider, item.id, item.quantity + 1);
    }

    onDeliverySelect(provider: ProductProvider, deliveryOpt: DeliveryOption) {
        const req: UpdateDeliveryRequest = {
            productProvider: provider,
            deliveryFee: deliveryFee[deliveryOpt],
        }
        this.cartSvc.UpdateDelivery(req).subscribe({
            next: () => this.pushCarts(),
            error: (err) => console.error("[onDeliverySelect] 更新運費失敗", err)
        });
    }

    onCheckOut(provider: ProductProvider, deliveryOpt: DeliveryOption, paymentOpt: PaymentOption) {
        const req: CheckoutDraftDto = {
            productProvider: provider,
            deliveryOption: deliveryOpt,
            paymentOption: paymentOpt,
            buyerName: "",
            buyerEmail: "",
            buyerPhone: "",
            receiverName: "",
            receiverPhone: "",
            countyId: 0,
            districtId: 0,
            address: "",
            fullAddress: "",
        };
        this.cartSvc.upsertCheckoutDraft(req).subscribe({
            next: () => this.router.navigate(['/checkout']),
            error: (err) => console.error("[onCheckOut] 更新/插入購物車草稿失敗", err)
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
