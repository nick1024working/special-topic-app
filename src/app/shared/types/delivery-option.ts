export const DELIVERIES = ['HomeDeliveryHCT', '711PickupPay', '711PickupOnly', 'FaceToFace', 'NoDelivery'] as const;
export type DeliveryOption = typeof DELIVERIES[number];

export const deliveryRepr: Record<DeliveryOption, string> = {
    'HomeDeliveryHCT': '宅配-新竹物流',
    '711PickupPay': '7-11 取貨付款',
    '711PickupOnly': '7-11 取貨不付款',
    'FaceToFace': '面交',
    'NoDelivery': '不須送貨',
}
export const deliveryFee: Record<DeliveryOption, number> = {
    'HomeDeliveryHCT': 120,
    '711PickupPay': 60,
    '711PickupOnly': 60,
    'FaceToFace': 0,
    'NoDelivery': 0,
}
