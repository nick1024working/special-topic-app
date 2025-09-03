export interface LinePayRequestResponseDto {
    returnCode: string;
    returnMessage: string;
    info: LinePayRequestInfo | null;
}

export interface LinePayRequestInfo {
    paymentUrl: LinePayPaymentUrl | null;
    transactionId: string;
    paymentAccessToken: string | null;
}

export interface LinePayPaymentUrl {
    web: string | null;
    app: string | null;
}
