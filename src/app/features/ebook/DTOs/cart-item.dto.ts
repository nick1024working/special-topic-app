export interface CartItemDto {
    ebookId: number;
    ebookName: string;
    price: number; // 將會是書籍的實際售價或定價
    quantity: number;
    primaryCoverPath: string | null;
}