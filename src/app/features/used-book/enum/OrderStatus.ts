export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Confirmed = 2,
    Completed = 3,
    Cancelled = 4,
}

export function orderStatusToRepr(s: OrderStatus): string {
    return orderStatusRepr[s];
}
export const orderStatusRepr: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: '等待中',
    [OrderStatus.Processing]: '處理中',
    [OrderStatus.Confirmed]: '已確認',
    [OrderStatus.Completed]: '已完成',
    [OrderStatus.Cancelled]: '已取消',
};
