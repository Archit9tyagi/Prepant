import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import type {
  PaymentProvider,
  CreateOrderInput,
  CreateOrderResult,
  VerifySignatureInput,
  RefundResult,
} from './types.js';
import { env } from '../../config/env.js';

export class RazorpayPaymentProvider implements PaymentProvider {
  private readonly client = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const order = await this.client.orders.create({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
    });
    return { orderId: order.id, amountPaise: Number(order.amount), currency: order.currency };
  }

  verifySignature(params: VerifySignatureInput): boolean {
    const digest = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex');
    const provided = Buffer.from(params.signature);
    const expected = Buffer.from(digest);
    return provided.length === expected.length && crypto.timingSafeEqual(expected, provided);
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    const digest = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    const provided = Buffer.from(signature);
    const expected = Buffer.from(digest);
    return provided.length === expected.length && crypto.timingSafeEqual(expected, provided);
  }

  async refund(paymentId: string, amountPaise: number, reason?: string): Promise<RefundResult> {
    const refund = await this.client.payments.refund(paymentId, {
      amount: amountPaise,
      notes: { reason: reason ?? 'booking cancellation' },
    });
    return { refundId: refund.id, amountPaise: Number(refund.amount), status: refund.status };
  }
}
