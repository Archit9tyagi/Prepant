import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const slotLockSchema = new Schema(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slotStart: { type: Date, required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  },
  { timestamps: true },
);

slotLockSchema.index({ mentor: 1, slotStart: 1 }, { unique: true });

export type SlotLockDocument = InferSchemaType<typeof slotLockSchema> & mongoose.Document;
export const SlotLock = mongoose.model('SlotLock', slotLockSchema);
