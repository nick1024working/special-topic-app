import { ProductProvider } from "../types/product-provider";

export interface UpdateDeliveryRequest {
    productProvider: ProductProvider;
    deliveryFee: number;
}
