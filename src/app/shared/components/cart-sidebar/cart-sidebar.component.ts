import { RouterLink } from '@angular/router';
import { CartDto } from './../../dtos/cart.dto';
import { Component, inject, signal } from '@angular/core';
import { CartService } from 'app/features/ebook/services/cart.service';
import { CartItemDto } from 'app/shared/dtos/cart-item.dto';
import { PaymentService } from 'app/shared/services/payment.service';

@Component({
    selector: 'app-sh-cart-sidebar',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './cart-sidebar.component.html',
    styleUrl: './cart-sidebar.component.css'
})
export class CartSidebarComponent {
    private readonly _cartSvc = inject(CartService);
    private readonly _paymentSvc = inject(PaymentService);

    cart = signal<CartDto | undefined>(undefined);

    // ========== HOOK ==========

    ngOnInit(): void {
        const cart = this.getMockCart();
        this.recalculate(cart);
        this.cart.set(cart);
    }

    // ========== 事件 ==========

    // TODO: 需呼叫後端
    removeItem(id: string) {
        const cart = this.cart();
        if (!cart) return;

        const nextCart = this.buildNextCart(cart);
        nextCart.items = this.cart()?.items.filter(item => item.id !== id) ?? [];

        this.recalculate(nextCart);
        this.cart.set(nextCart.items.length > 0 ? nextCart : undefined);
    }

    // TODO: 需呼叫後端
    clearCart() {
        this.cart.set(undefined);
    }

    // ========== Mock 方法 ==========

    private getMockCart(): CartDto {
        return {
            items: Array.from({ length: 6 }, () => this.buildRandCartItem()),
            subtotal: 0,
            discountTotal: 0,
            shippingFee: 0,
            grandTotal: 0,
            updatedAt: Date.UTC.toString(),
        }
    }

    private buildRandCartItem(): CartItemDto {
        const name: string = 'Name-' + this.randomString(5)
        return {
            imageUrl: 'https://placehold.co/200x200?text=' + name,
            id: 'PD-' + this.randomString(10),
            name,
            quantity: this.randomRange(1, 10),
            unitPrice: this.randomRange(49, 399),
        }
    }

    // ========== 工具函數 ==========

    private recalculate(cart: CartDto) {
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        cart.grandTotal = cart.subtotal - cart.discountTotal - cart.shippingFee;
    }

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

    private randomRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

}
