import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 500 },
    link: String,
    readAt: Date,
  },
  { timestamps: true },
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & mongoose.Document;
export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
