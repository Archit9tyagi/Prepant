import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: String,
    passwordHash: String,
    googleId: { type: String, sparse: true, unique: true },
    role: { type: String, enum: ['student', 'mentor', 'admin'], required: true },
    avatar: { url: String, publicId: String },
    timezone: { type: String, default: 'Asia/Kolkata' },
    country: String,
    locale: { type: String, enum: ['en', 'hi'], default: 'en' },
    emailVerifiedAt: Date,
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    guardian: { name: String, phone: String, email: String },
    learnerPrefs: {
      goal: String,
      level: String,
      budgetMaxPaise: Number,
      preferredTimes: [String],
      subjects: [String],
    },
    notificationPrefs: { email: { type: Boolean, default: true } },
    lastLoginAt: Date,
    deletedAt: Date,
    emailVerificationTokenHash: String,
    emailVerificationExpiresAt: Date,
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document;
export const User = mongoose.models.User || mongoose.model('User', userSchema);
