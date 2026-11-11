import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 2000, trim: true },
    attachments: [{ url: String, name: String, type: String }],
    readAt: Date,
  },
  { timestamps: true },
);

messageSchema.index({ conversation: 1, createdAt: -1 });

export type MessageDocument = InferSchemaType<typeof messageSchema> & mongoose.Document;
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
