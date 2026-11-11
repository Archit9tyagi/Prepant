import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const payoutSchema = new Schema(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountPaise: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['requested', 'paid', 'rejected'],
      default: 'requested',
      index: true,
    },
    reference: String,
    processedAt: Date,
    note: String,
  },
  { timestamps: true },
);

export type PayoutDocument = InferSchemaType<typeof payoutSchema> & mongoose.Document;
export const Payout = mongoose.models.Payout || mongoose.model('Payout', payoutSchema);
