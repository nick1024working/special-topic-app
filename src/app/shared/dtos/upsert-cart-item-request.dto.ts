import { ProductProvider } from "../enums/product-provider";

export interface UpsertCartItemRequest {
    productProvider: ProductProvider;
    id: string;
    name?: string;
    imageUrl?: string;
    unitPrice?: number;
    quantity: number;
}
