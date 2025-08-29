import { DeliveryOption } from "app/shared/types/delivery-option";
import { PaymentOption } from "app/shared/types/payment-option";

export interface CreateOrderRequestDto {
    paymentMethod: PaymentOption,
    deilveryMethod: DeliveryOption,
    bookIdList: string[],
}
