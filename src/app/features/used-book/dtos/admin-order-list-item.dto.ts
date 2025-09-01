import { OrderStatus } from "../enum/OrderStatus";
import { PaymentStatus } from "../enum/PaymentStatus";
import { DeliveryStatus } from "../enum/DeliveryStatus";
import { PaymentMethod } from "../enum/PaymentMethod";
import { DeliveryMethod } from "../enum/DeliveryMethod";

export interface AdminOrderListItemDto {
    orderNo: string,
    buyerId: string,
    buyerName: string,
    buyerEmail: string,
    sellerId: string,
    sellerName: string,
    sellerEmail: string,

    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus,
    deliveryStatus: DeliveryStatus,
    paymentMethod: PaymentMethod,
    deliveryMethod: DeliveryMethod,

    subtotal: number,
    discountTotal: number,
    deliveryFee: number,
    grandTotal: number,

    updatedAt: string;
    createdAt: string;
}
