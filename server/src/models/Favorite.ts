import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const favoriteSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ student: 1, mentor: 1 }, { unique: true });

export type FavoriteDocument = InferSchemaType<typeof favoriteSchema> & mongoose.Document;
export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
