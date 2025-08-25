export interface CartItemDto {
    imageUrl?: string;
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    props?: Record<string, string>;
}
