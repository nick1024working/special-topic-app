export const PAYMENTS = ['LINEPay', 'TransferAndATM', 'CreditCard', 'FaceToFace'] as const;
export type PaymentOption = typeof PAYMENTS[number];

export function paymentToRepr(p: PaymentOption): string {
    return paymentRepr[p];
}
export const paymentRepr: Record<PaymentOption, string> = {
    LINEPay: 'LINE Pay',
    TransferAndATM: '銀行轉帳/ATM',
    CreditCard: '信用卡',
    FaceToFace: '面交',
}

export function paymentToDesc(p: PaymentOption): string {
    return paymentDesc[p];
}
export const paymentDesc: Record<PaymentOption, string> = {
    LINEPay: '將跳轉至 LINE Pay 完成付款。',
    TransferAndATM: '提交訂單後將顯示匯款資訊。',
    CreditCard: '將跳轉至綠界金流，使用信用卡線上刷卡付款。',
    FaceToFace: '取貨時雙方當面協調付款。'
};
