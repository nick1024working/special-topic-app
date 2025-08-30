import { OrderStatus } from "../enum/OrderStatus";
import { PaymentStatus } from "../enum/PaymentStatus";
import { DeliveryStatus } from "../enum/DeliveryStatus";
import { PaymentMethod } from "../enum/PaymentMethod";
import { DeliveryMethod } from "../enum/DeliveryMethod";
import { OrderItemDto } from "./order-item.dto";

export interface OrderDetailDto {
    itmes: OrderItemDto[],

    orderNo: string,

    buyerId: string,
    buyerName: string,
    buyerPhone: string,
    buyerEmail: string,
    sellerId: string,
    sellerName: string,
    sellerPhone: string,
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
