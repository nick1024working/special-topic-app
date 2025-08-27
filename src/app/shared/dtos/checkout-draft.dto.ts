import { DeliveryOption } from "../types/delivery-option";
import { PaymentOption } from "../types/payment-option";
import { ProductProvider } from "../types/product-provider";

export interface CheckoutDraftDto {
    productProvider: ProductProvider;
    deliveryOption: DeliveryOption;
    paymentOption: PaymentOption;
}
