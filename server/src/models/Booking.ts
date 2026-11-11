import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const bookingSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorProfile: { type: Schema.Types.ObjectId, ref: 'MentorProfile', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    durationMins: { type: Number, required: true },
    type: { type: String, enum: ['trial', 'single', 'pack'], required: true },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'completed',
        'cancelled_by_student',
        'cancelled_by_mentor',
        'expired',
        'no_show_student',
        'no_show_mentor',
        'needs_review',
      ],
      default: 'pending_payment',
      index: true,
    },
    price: {
      amountPaise: { type: Number, required: true },
      discountPaise: { type: Number, required: true, default: 0 },
      platformFeePaise: { type: Number, required: true },
      mentorEarningPaise: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    holdExpiresAt: Date,
    goals: { type: String, maxlength: 2000 },
    level: { type: String, maxlength: 80 },
    meeting: { provider: String, roomId: String, url: String },
    attendance: { studentJoinedAt: Date, mentorJoinedAt: Date },
    cancel: { by: String, reason: String, at: Date, refundPaise: Number },
    rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Booking' },
    completedAt: Date,
    mentorNotes: String,
  },
  { timestamps: true },
);

bookingSchema.index({ student: 1, startAt: 1 });
bookingSchema.index({ mentor: 1, startAt: 1 });
bookingSchema.index({ status: 1, holdExpiresAt: 1 });

export type BookingDocument = InferSchemaType<typeof bookingSchema> & mongoose.Document;
export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
