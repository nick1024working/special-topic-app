import { ProductProvider } from "../enums/product-provider";
import { CartDto } from "./cart.dto";

export interface AllCartsDto {
    carts: Record<ProductProvider, CartDto>;
    grandTotal: number;
    updatedAt: string;
}
