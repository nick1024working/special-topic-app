export enum DeliveryStatus {
    Preparing = 0,
    Shipped = 1,
    Delivered = 2,
    PickedUp = 3,
    Returning = 4,
    Returned = 5
}

export function deliveryStatusToRepr(s: DeliveryStatus): string {
    return deliveryStatusRepr[s];
}
export const deliveryStatusRepr: Record<DeliveryStatus, string> = {
    [DeliveryStatus.Preparing]: '準備中',
    [DeliveryStatus.Shipped]: '已出貨',
    [DeliveryStatus.Delivered]: '已送達',
    [DeliveryStatus.PickedUp]: '已取件',
    [DeliveryStatus.Returning]: '退貨中',
    [DeliveryStatus.Returned]: '已退貨'
};
