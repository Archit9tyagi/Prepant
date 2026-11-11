import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const rangeSchema = new Schema(
  { start: { type: String, required: true }, end: { type: String, required: true } },
  { _id: false },
);

const availabilitySchema = new Schema(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    timezone: { type: String, required: true, default: 'Asia/Kolkata' },
    weekly: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    exceptions: [
      {
        date: { type: String, required: true },
        type: { type: String, enum: ['off', 'custom'], required: true },
        ranges: { type: [rangeSchema], default: [] },
      },
    ],
    bufferMinutes: { type: Number, enum: [0, 15, 30], default: 0 },
    minNoticeHours: { type: Number, min: 0, default: 12 },
    maxAdvanceDays: { type: Number, min: 1, default: 60 },
  },
  { timestamps: true },
);

export type AvailabilityDocument = InferSchemaType<typeof availabilitySchema> & mongoose.Document;
export const Availability =
  mongoose.models.Availability || mongoose.model('Availability', availabilitySchema);
