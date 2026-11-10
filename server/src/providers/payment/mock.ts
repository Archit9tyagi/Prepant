import { randomBytes } from 'crypto';
import type {
  PaymentProvider,
  CreateOrderInput,
  CreateOrderResult,
  VerifySignatureInput,
  RefundResult,
} from './types.js';

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const orderId = `order_mock_${Date.now()}_${randomBytes(4).toString('hex')}`;
    return {
      orderId,
      amountPaise: input.amountPaise,
      currency: input.currency || 'INR',
    };
  }

  verifySignature(_params: VerifySignatureInput): boolean {
    return true;
  }

  verifyWebhook(_rawBody: string, _signature: string): boolean {
    return true;
  }

  async refund(_paymentId: string, amountPaise: number, _reason?: string): Promise<RefundResult> {
    return {
      refundId: `rfnd_mock_${Date.now()}_${randomBytes(4).toString('hex')}`,
      amountPaise,
      status: 'processed',
    };
  }
}
