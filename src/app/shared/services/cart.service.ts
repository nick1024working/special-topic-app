import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AllCartsDto } from '../dtos/all-carts.dto';
import { ProductProvider, providerToValue } from '../enums/product-provider';
import { UpsertCartItemRequest } from '../dtos/upsert-cart-item-request.dto';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly _http = inject(HttpClient);

    private readonly baseUrl = `${environment.apiBaseUrl}/api/carts`;

    getCart(): Observable<AllCartsDto> {
        return this._http.get<AllCartsDto>(`${this.baseUrl}`, { withCredentials: true });
    }

    upsertItem(req: UpsertCartItemRequest): Observable<void> {
        return this._http.patch<void>(
            `${this.baseUrl}/items`,
            { ...req, productProvider: providerToValue(req.productProvider) },
            { withCredentials: true }
        );
    }

    removeItem(provider: ProductProvider, id: string): Observable<void> {
        console.log(providerToValue(provider));
        return this._http.delete<void>(
            `${this.baseUrl}/items/${providerToValue(provider)}/${encodeURIComponent(id)}`,
            { withCredentials: true }
        );
    }

    clearCart(): Observable<void> {
        return this._http.delete<void>(`${this.baseUrl}`, { withCredentials: true });
    }
}
