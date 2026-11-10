export interface CreateOrderInput {
  amountPaise: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResult {
  orderId: string;
  amountPaise: number;
  currency: string;
}

export interface VerifySignatureInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundResult {
  refundId: string;
  amountPaise: number;
  status: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifySignature(params: VerifySignatureInput): boolean;
  verifyWebhook(rawBody: string, signature: string): boolean;
  refund(paymentId: string, amountPaise: number, reason?: string): Promise<RefundResult>;
}
