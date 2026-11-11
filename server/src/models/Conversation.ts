import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { text: String, at: Date, sender: { type: Schema.Types.ObjectId, ref: 'User' } },
    unread: {
      student: { type: Number, default: 0 },
      mentor: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema> & mongoose.Document;
export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
