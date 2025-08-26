import { Component, inject } from '@angular/core';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';
import { UpsertCartItemRequest } from 'app/shared/dtos/upsert-cart-item-request.dto';
import { CartService } from 'app/shared/services/cart.service';

@Component({
    selector: 'app-ub-test-page',
    standalone: true,
    imports: [],
    templateUrl: './test-page.component.html',
    styleUrl: './test-page.component.css'
})
export class TestPageComponent {
    private readonly _cartSvc = inject(CartService);
    private readonly _cartSidebarApi = inject(CartSidebarApi);

    onAddCartEbook() {
        const request: UpsertCartItemRequest = {
            productProvider: 'EBook',
            id: "89757",
            name: "win98跟我學",
            imageUrl: "https://placehold.co/200x200?text=WIN-98.jpg",
            unitPrice: 199,
            quantity: 3,
        };
        this._cartSvc.upsertItem(request).subscribe({
            next: () => this._cartSidebarApi.show(),
        })
    }

    onAddCartFund() {
        const request: UpsertCartItemRequest = {
            productProvider: 'Fund',
            id: "3345678",
            name: "一堆騙錢拖鞋",
            imageUrl: "https://placehold.co/200x200?text=Slippers.jpg",
            unitPrice: 2980,
            quantity: 2,
        };
        this._cartSvc.upsertItem(request).subscribe({
            next: () => this._cartSidebarApi.show(),
        })
    }
}
