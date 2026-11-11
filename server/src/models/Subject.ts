import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const subjectSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    aliases: { type: [String], default: [] },
    levels: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    seo: { title: String, description: String },
    isActive: { type: Boolean, default: true },
    mentorCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

subjectSchema.index({ name: 'text', aliases: 'text', tags: 'text' });

export type SubjectDocument = InferSchemaType<typeof subjectSchema> & mongoose.Document;
export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
