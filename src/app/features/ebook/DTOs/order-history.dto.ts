// 這個 DTO 描述訂單中的單一商品項目
export interface OrderHistoryItemDto {
    ebookId: number;
    ebookName: string;
    price: number;
    quantity: number;
    primaryCoverPath: string | null; // 後端提供的圖片路徑
}

// 這個 DTO 描述一筆完整的歷史訂單
export interface OrderHistoryDto {
    orderId: string;
    orderDate: string;
    status: string;
    totalAmount: number;
    items: OrderHistoryItemDto[];
}
