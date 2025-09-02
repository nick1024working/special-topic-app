import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AllCartsDto } from '../dtos/all-carts.dto';
import { ProductProvider, providerToValue } from '../types/product-provider';
import { UpsertCartItemRequest } from '../dtos/upsert-cart-item-request.dto';
import { CartDto } from '../dtos/cart.dto';
import { UpdateDeliveryRequest } from '../dtos/update-delivery-request.dto copy';
import { CheckoutDraftDto } from '../dtos/checkout-draft.dto';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly _http = inject(HttpClient);

    private readonly baseUrl = `${environment.apiBaseUrl}/api/carts`;

    // ========== 購物車 ==========

    getCart(): Observable<AllCartsDto> {
        return this._http.get<AllCartsDto>(`${this.baseUrl}`, { withCredentials: true });
    }

    getCartByProvider(provider: ProductProvider): Observable<CartDto> {
        return this._http.get<CartDto>(`${this.baseUrl}/items/${providerToValue(provider)}`, { withCredentials: true });
    }

    UpdateDelivery(req: UpdateDeliveryRequest): Observable<void> {
        return this._http.patch<void>(
            `${this.baseUrl}/delivery`,
            { ...req, productProvider: providerToValue(req.productProvider)},
            { withCredentials: true });
    }

    upsertItem(req: UpsertCartItemRequest): Observable<void> {
        return this._http.patch<void>(
            `${this.baseUrl}/items`,
            { ...req, productProvider: providerToValue(req.productProvider) },
            { withCredentials: true }
        );
    }

    removeItem(provider: ProductProvider, id: string): Observable<void> {
        return this._http.delete<void>(
            `${this.baseUrl}/items/${providerToValue(provider)}/${encodeURIComponent(id)}`,
            { withCredentials: true }
        );
    }

    clearCart(): Observable<void> {
        return this._http.delete<void>(`${this.baseUrl}`, { withCredentials: true });
    }

    // ========== 結帳草稿 ==========

    getCheckoutDraft(): Observable<CheckoutDraftDto> {
        return this._http.get<CheckoutDraftDto>(`${this.baseUrl}/checkout-draft`, { withCredentials: true });
    }

    upsertCheckoutDraft(req: CheckoutDraftDto): Observable<void> {
        return this._http.put<void>(`${this.baseUrl}/checkout-draft`, req, { withCredentials: true });
    }


}
