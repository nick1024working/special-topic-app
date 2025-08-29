import { ProductProvider } from "../types/product-provider";

export interface UpsertCartItemRequest {
    productProvider: ProductProvider;
    id: string;
    name?: string;
    imageUrl?: string;
    unitPrice?: number;
    quantity: number;
}
