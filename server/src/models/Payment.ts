import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const paymentSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['razorpay', 'mock'], required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: String,
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
    },
    refunds: [{ refundId: String, amountPaise: Number, reason: String, at: Date }],
    method: String,
    webhookEventIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & mongoose.Document;
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
