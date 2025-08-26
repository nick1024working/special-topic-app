// src/app/features/ebook/DTOs/order.dto.ts

import { OrderItemDto } from './order-item.dto';

export interface OrderDto {
    orderId: string; // 訂單編號通常是字串
    orderDate: string; // 日期先用字串格式
    totalAmount: number;
    status: string; // 例如：'已完成', '處理中', '已取消'
    items: OrderItemDto[]; // 一筆訂單會包含多個商品
}
