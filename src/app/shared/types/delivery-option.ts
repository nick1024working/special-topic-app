export const DELIVERIES = ['HomeDeliveryHCT', '711PickupPay', '711PickupOnly', 'FaceToFace', 'NoDelivery'] as const;
export type DeliveryOption = typeof DELIVERIES[number];

export function deliveryToRepr(p: DeliveryOption): string {
    return deliveryRepr[p];
}
export const deliveryRepr: Record<DeliveryOption, string> = {
    HomeDeliveryHCT: '宅配-新竹物流',
    '711PickupPay': '7-11 取貨付款',
    '711PickupOnly': '7-11 取貨不付款',
    FaceToFace: '面交',
    NoDelivery: '不須送貨',
}

export function deliveryToFee(p: DeliveryOption): number {
    return deliveryFee[p];
}
export const deliveryFee: Record<DeliveryOption, number> = {
    HomeDeliveryHCT: 120,
    '711PickupPay': 60,
    '711PickupOnly': 60,
    FaceToFace: 0,
    NoDelivery: 0,
}

export function deliveryToDesc(p: DeliveryOption): string {
    return deliveryDesc[p];
}
export const deliveryDesc: Record<DeliveryOption, string> = {
    HomeDeliveryHCT: '由新竹物流宅配到府，請填寫正確收件地址。',
    '711PickupPay': '選擇 7-11 門市取貨並於取貨時付款。',
    '711PickupOnly': '選擇 7-11 門市取貨，取貨時無需付款。',
    FaceToFace: '與賣家約定地點面交，當場交付商品與付款。',
    NoDelivery: '此商品無需配送（例如電子書）。'
};
