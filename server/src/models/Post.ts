import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, maxlength: 500, default: '' },
    contentMarkdown: { type: String, required: true },
    coverImage: { url: String, publicId: String },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: Date,
    seo: { title: String, description: String },
  },
  { timestamps: true },
);

export type PostDocument = InferSchemaType<typeof postSchema> & mongoose.Document;
export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
