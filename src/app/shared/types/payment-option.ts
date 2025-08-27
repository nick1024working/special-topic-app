export const PAYMENTS = ['LINEPay', 'TransferAndATM', 'CreditCard', 'FaceToFace'] as const;
export type PaymentOption = typeof PAYMENTS[number];

export const paymentRepr: Record<PaymentOption, string> = {
    'LINEPay': 'LINE Pay',
    'TransferAndATM': '銀行轉帳/ATM',
    'CreditCard': '信用卡',
    'FaceToFace': '面交',
}
