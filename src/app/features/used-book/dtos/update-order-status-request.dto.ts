import { DeliveryStatus } from "../enum/DeliveryStatus";
import { OrderStatus } from "../enum/OrderStatus";
import { PaymentStatus } from "../enum/PaymentStatus";

export interface UpdateOrderStatusRequestDto {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
}
