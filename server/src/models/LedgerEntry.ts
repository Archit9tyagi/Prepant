import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const ledgerEntrySchema = new Schema(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    type: {
      type: String,
      enum: ['earning', 'refund_reversal', 'adjustment', 'payout'],
      required: true,
    },
    amountPaise: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'available', 'paid', 'reversed'],
      default: 'pending',
    },
    availableAt: Date,
    note: String,
  },
  { timestamps: true },
);

export type LedgerEntryDocument = InferSchemaType<typeof ledgerEntrySchema> & mongoose.Document;
export const LedgerEntry =
  mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', ledgerEntrySchema);
