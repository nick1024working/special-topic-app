import { DeliveryOption } from "../types/delivery-option";
import { PaymentOption } from "../types/payment-option";
import { ProductProvider } from "../types/product-provider";

export interface CheckoutDraftDto {
    productProvider: ProductProvider;
    deliveryOption: DeliveryOption;
    paymentOption: PaymentOption;

    buyerId : string | null;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    receiverName: string;
    receiverPhone: string;

    countyId: number;
    districtId: number;
    address: string;
    fullAddress: string;
}
