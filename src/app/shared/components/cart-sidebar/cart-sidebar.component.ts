import { RouterLink } from '@angular/router';
import { CartDto } from './../../dtos/cart.dto';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { AllCartsDto } from 'app/shared/dtos/all-carts.dto';
import { CartService } from 'app/shared/services/cart.service';
import { ProductProvider, typedEntries, providerToRepr } from 'app/shared/enums/product-provider';
import { CartSidebarApi } from './cart-sidebar.api';


@Component({
    selector: 'app-sh-cart-sidebar',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './cart-sidebar.component.html',
    styleUrl: './cart-sidebar.component.css'
})
export class CartSidebarComponent {
    private readonly _cartSvc = inject(CartService);
    private readonly _api = inject(CartSidebarApi);
    readonly providerToRepr = providerToRepr;

    // 視覺上展開 cartSidebar(本元件的HTML) 用
    @ViewChild('cartSidebar', { static: true }) offEl!: ElementRef<HTMLElement>;
    private off!: any;

    // 資料
    allCarts = signal<AllCartsDto | undefined>(undefined);
    cartEntries = computed(() =>
        this.allCarts()
            ? typedEntries(this.allCarts()!.carts)
                .filter(([_, cart]) => cart.items.length > 0)
                .map(([provider, cart]) => ({ provider, cart: cart! }))
            : []
    );

    /** 視覺上展開 cartSidebar 並提前呼叫 pushCarts() */
    show() {
        this.pushCarts();
        this.off.show();
    }

    pushCarts() {
        this._cartSvc.getCart().subscribe({
            next: res => {
                this.allCarts.set(res);
                console.log("[pushCarts]", res);
                console.log("[pushCarts cartEntries]", this.cartEntries());
            },
            error: err => console.error("[pushCarts] 無法取得所有購物車", err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.pushCarts();
    }

    ngAfterViewInit(): void {
        this.off = bootstrap.Offcanvas.getOrCreateInstance(this.offEl.nativeElement);
        this._api.show = () => this.show();
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

    // ========== 工具函數 ==========
    private buildNextCart(cart: CartDto): CartDto {
        return {
            items: [...cart.items],
            subtotal: cart.shippingFee,
            discountTotal: cart.shippingFee,
            shippingFee: cart.shippingFee,
            grandTotal: cart.grandTotal,
            updatedAt: cart.updatedAt,
        };
    }
}
