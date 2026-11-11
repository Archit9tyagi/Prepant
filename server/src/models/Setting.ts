import mongoose, { Schema } from 'mongoose';

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
