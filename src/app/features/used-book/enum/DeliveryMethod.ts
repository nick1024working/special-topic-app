export enum DeliveryMethod {
    FaceToFace = 0,
    HomeDeliveryHCT = 1,
    C711PickupPay = 2,
    C711PickupOnly = 3,
}

export function deliveryMethodToRepr(s: DeliveryMethod): string {
    return deliveryMethodRepr[s];
}
export const deliveryMethodRepr: Record<DeliveryMethod, string> = {
    [DeliveryMethod.FaceToFace]: '面交',
    [DeliveryMethod.HomeDeliveryHCT]: '宅配-新竹物流',
    [DeliveryMethod.C711PickupPay]: '7-11 取貨付款',
    [DeliveryMethod.C711PickupOnly]: '7-11 取貨不付款',
};
