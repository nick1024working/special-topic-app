import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserOrderListItemDto } from '../dtos/user-order-list-item.dto';
import { CreateOrderRequestDto } from '../dtos/create-order-request.dto';
import { PaymentOption } from 'app/shared/types/payment-option';
import { DeliveryOption } from 'app/shared/types/delivery-option';
import { UpdateOrderStatusRequestDto } from '../dtos/update-order-status-request.dto';
import { PaymentMethod } from '../enum/PaymentMethod';
import { DeliveryMethod } from '../enum/DeliveryMethod';

@Injectable({
    providedIn: 'root'
})
export class UsedBookOrderService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks`;

    constructor(private http: HttpClient) { }

    createOrder(req: CreateOrderRequestDto): Observable<string> {
        return this.http.post<string>(
            `${this.baseUrl}/orders`,
            { ...req, paymentMethod: this.paymentMap[req.paymentMethod], deliveryMethod: this.deliveryMap[req.deilveryMethod] },
            { withCredentials: true });
    }

    updateOrderStatus(orderNo: string, request: UpdateOrderStatusRequestDto): Observable<null> {
        return this.http.patch<null>(`${this.baseUrl}/orders/${orderNo}`, request, { withCredentials: true });
    }

    getSellerOrderList(): Observable<UserOrderListItemDto[]> {
        return this.http.get<UserOrderListItemDto[]>(`${this.baseUrl}/sellers/orders`, { withCredentials: true });
    }

    getbuyerOrderList(): Observable<UserOrderListItemDto[]> {
        return this.http.get<UserOrderListItemDto[]>(`${this.baseUrl}/buyers/orders`, { withCredentials: true });
    }

    private paymentMap: Record<PaymentOption, PaymentMethod> = {
        FaceToFace: PaymentMethod.FaceToFace,
        LINEPay: PaymentMethod.LINEPay,
        TransferAndATM: PaymentMethod.TransferAndATM,
        CreditCard: PaymentMethod.CreditCard,
    }

    private deliveryMap: Record<DeliveryOption, DeliveryMethod> = {
        FaceToFace: DeliveryMethod.FaceToFace,
        HomeDeliveryHCT: DeliveryMethod.HomeDeliveryHCT,
        '711PickupPay': DeliveryMethod.C711PickupPay,
        '711PickupOnly': DeliveryMethod.C711PickupOnly,
        NoDelivery: DeliveryMethod.FaceToFace,
    }
}

