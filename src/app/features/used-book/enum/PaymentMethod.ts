import { PaymentOption } from "app/shared/types/payment-option";

export enum PaymentMethod {
    FaceToFace = 0,
    LINEPay = 1,
    TransferAndATM = 2,
    CreditCard = 3,
}

export function paymentMethodToRepr(s: PaymentMethod): string {
    return paymentMethodRepr[s];
}
export const paymentMethodRepr: Record<PaymentMethod, string> = {
    [PaymentMethod.FaceToFace]: '面交',
    [PaymentMethod.LINEPay]: 'LINEPay',
    [PaymentMethod.TransferAndATM]: '轉帳/ATM',
    [PaymentMethod.CreditCard]: '信用卡',
};

export function paymentOptToMth(s: PaymentOption): PaymentMethod {
    return paymentOptMth[s];
}
export const paymentOptMth: Record<PaymentOption, PaymentMethod> = {
    "FaceToFace": PaymentMethod.FaceToFace,
    "LINEPay": PaymentMethod.LINEPay,
    "TransferAndATM": PaymentMethod.TransferAndATM,
    "CreditCard": PaymentMethod.CreditCard,
};
