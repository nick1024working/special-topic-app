import { CartItemDto } from "./cart-item.dto";

export interface CartDto {
    items: CartItemDto[];
    subtotal: number;
    discountTotal: number;
    deliveryFee: number;
    grandTotal: number;
    updatedAt: string;
}
