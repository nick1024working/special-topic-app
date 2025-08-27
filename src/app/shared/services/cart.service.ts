import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { CartDto } from '../dtos/cart.dto';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly _http = inject(HttpClient);

    private readonly baseUrl = `${environment.apiBaseUrl}/api/cart`;

    getCart(): Observable<CartDto> {
        return this._http.get<CartDto>(`${this.baseUrl}`);
    }

    replaceCart(cart: CartDto): Observable<void> {
        return this._http.put<void>(`${this.baseUrl}`, cart);
    }

    // TODO: 待後端完成
    // upsertItem(req: PatchItemRequest): Observable<void> {
    //   return this._http.patch<void>(`${this.baseUrl}/items`, req);
    // }

    removeItem(id: string): Observable<void> {
        return this._http.delete<void>(`${this.baseUrl}/items/${encodeURIComponent(id)}`);
    }

    clearCart(): Observable<void> {
        return this._http.delete<void>(`${this.baseUrl}`);
    }
}
