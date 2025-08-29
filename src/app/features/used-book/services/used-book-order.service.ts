import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserOrderListItemDto } from '../dtos/user-order-list-item.dto';
import { CreateOrderRequestDto } from '../dtos/create-order-request.dto';
import { PaymentOption } from 'app/shared/types/payment-option';
import { DeliveryOption } from 'app/shared/types/delivery-option';

@Injectable({
    providedIn: 'root'
})
export class UsedBookOrderService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/orders`;

    constructor(private http: HttpClient) { }

    createOrder(req: CreateOrderRequestDto): Observable<string> {
        return this.http.post<string>(
            `${this.baseUrl}`,
            { ...req, paymentMethod: this.paymentMap[req.paymentMethod], deliveryMethod: this.deliveryMap[req.deilveryMethod] },
            { withCredentials: true });
    }

    // updateOrderStatus(orderNo: string, request: UpdateOrderStatusRequest): Observable<null> {
    //     return this.http.patch<null>(`${this.baseUrl}/${orderNo}`, request, { withCredentials: true });
    // }

    getUserOrderList(): Observable<UserOrderListItemDto[]> {
        return this.http.get<UserOrderListItemDto[]>(`${this.baseUrl}`, { withCredentials: true });
    }

    private paymentMap: Record<PaymentOption, number> = {
        FaceToFace: 0,
        LINEPay: 1,
        TransferAndATM: 2,
        CreditCard: 3,
    }

    private deliveryMap: Record<DeliveryOption, number> = {
        FaceToFace: 0,
        HomeDeliveryHCT: 1,
        '711PickupPay': 2,
        '711PickupOnly': 2,
        NoDelivery: -1,
    }
}

