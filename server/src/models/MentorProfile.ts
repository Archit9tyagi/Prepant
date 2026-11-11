import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const mentorProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    headline: { type: String, maxlength: 90, default: '' },
    bio: { type: String, maxlength: 5000, default: '' },
    introVideo: {
      provider: { type: String, enum: ['youtube', 'vimeo', 'upload'] },
      url: String,
    },
    subjects: [
      {
        subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
        levels: { type: [String], default: [] },
        boards: { type: [String], default: [] },
      },
    ],
    hourlyRatePaise: { type: Number, min: 0, default: 0 },
    durations: { type: [Number], default: [30, 60] },
    trialEnabled: { type: Boolean, default: true },
    languages: [{ code: String, level: String }],
    country: { type: String, default: 'IN' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    experienceYears: { type: Number, min: 0, default: 0 },
    education: [{ degree: String, institution: String, year: Number }],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        fileUrl: String,
        filePublicId: String,
      },
    ],
    workHistory: [{ role: String, org: String, from: String, to: String }],
    teachingStyle: String,
    idDocument: { url: String, verifiedAt: Date },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'],
      default: 'draft',
      index: true,
    },
    rejectionReason: String,
    badges: { type: [String], default: [] },
    stats: {
      ratingAvg: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      sessionsTaught: { type: Number, default: 0 },
      studentsTaught: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
    },
    payout: {
      method: { type: String, enum: ['upi', 'bank'] },
      encryptedDetails: String,
      verifiedAt: Date,
    },
    searchBoost: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
  },
  { timestamps: true },
);

mentorProfileSchema.index({ status: 1, 'subjects.subject': 1 });
mentorProfileSchema.index({ status: 1, hourlyRatePaise: 1 });
mentorProfileSchema.index({ headline: 'text', bio: 'text' });

export type MentorProfileDocument = InferSchemaType<typeof mentorProfileSchema> & mongoose.Document;
export const MentorProfile =
  mongoose.models.MentorProfile || mongoose.model('MentorProfile', mentorProfileSchema);
