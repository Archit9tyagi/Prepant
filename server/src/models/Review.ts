import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const reviewSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 2000, default: '' },
    tags: { type: [String], default: [] },
    mentorReply: { text: String, at: Date },
    status: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
  },
  { timestamps: true },
);

reviewSchema.index({ mentor: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & mongoose.Document;
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
