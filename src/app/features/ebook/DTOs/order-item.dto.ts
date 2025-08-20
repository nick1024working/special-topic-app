// src/app/features/ebook/DTOs/order-item.dto.ts

export interface OrderItemDto {
    ebookId: number;
    ebookName: string;
    price: number;
    quantity: number;
    primaryCoverPath: string | null;
}
