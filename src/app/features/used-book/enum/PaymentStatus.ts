export enum PaymentStatus {
    Unpaid = 0,
    Failed = 1,
    Expired = 2,
    Paid = 3,
    Refunding = 4,
    Refunded = 5,
}

export function paymentStatusToRepr(s: PaymentStatus): string {
    return paymentStatusRepr[s];
}
export const paymentStatusRepr: Record<PaymentStatus, string> = {
    [PaymentStatus.Unpaid]: '未付款',
    [PaymentStatus.Failed]: '付款失敗',
    [PaymentStatus.Expired]: '已逾期',
    [PaymentStatus.Paid]: '已付款',
    [PaymentStatus.Refunding]: '退款中',
    [PaymentStatus.Refunded]: '已退款',
};
