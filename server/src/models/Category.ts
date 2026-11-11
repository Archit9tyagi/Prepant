import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
    seo: { title: String, description: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CategoryDocument = InferSchemaType<typeof categorySchema> & mongoose.Document;
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
