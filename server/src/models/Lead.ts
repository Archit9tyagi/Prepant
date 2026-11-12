import mongoose, { Schema } from 'mongoose';

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true },
    interest: { type: String, required: true, maxlength: 160 },
    message: { type: String, maxlength: 2000 },
    notes: { type: String, maxlength: 2000, default: '' },
    source: { type: String, default: 'contact' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
  },
  { timestamps: true },
);

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
