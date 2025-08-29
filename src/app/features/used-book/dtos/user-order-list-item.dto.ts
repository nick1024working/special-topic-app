import { DeliveryOption } from "app/shared/types/delivery-option";
import { IdNameDto } from "./id-name.dto";

export interface UserOrderListItemDto {
    OrderNo: string,

    // orderStatus
    // paymentStatus
    // deliveryStatus
    // paymentMethod
    // deliveryMethod

    buyerId: string,
    sellerId: string,
    bookId: string,
    title: string,
    updatedAt: string;
    createdAt: string;
}
