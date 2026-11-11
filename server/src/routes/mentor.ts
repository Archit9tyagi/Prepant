import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { upload, assertUploadSize } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Subject } from '../models/Subject.js';
import { getStorageProvider } from '../providers/index.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { User } from '../models/User.js';

const router = Router();
const subjectInput = z.object({
  subject: z.string().min(1),
  levels: z.array(z.string().max(80)).default([]),
  boards: z.array(z.string().max(80)).default([]),
});
const profileSchema = z.object({
  headline: z.string().max(90).optional(),
  bio: z.string().max(5000).optional(),
  introVideo: z
    .object({ provider: z.enum(['youtube', 'vimeo', 'upload']), url: z.string().url() })
    .optional(),
  subjects: z.array(subjectInput).max(30).optional(),
  hourlyRatePaise: z.number().int().min(0).max(100000000).optional(),
  durations: z.array(z.number().int().min(30).max(180)).max(4).optional(),
  trialEnabled: z.boolean().optional(),
  languages: z
    .array(z.object({ code: z.string().min(2), level: z.string().min(1) }))
    .max(10)
    .optional(),
  country: z.string().max(80).optional(),
  timezone: z.string().max(80).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
  education: z
    .array(
      z.object({ degree: z.string(), institution: z.string(), year: z.number().int().optional() }),
    )
    .max(20)
    .optional(),
  workHistory: z
    .array(
      z.object({ role: z.string(), org: z.string(), from: z.string(), to: z.string().optional() }),
    )
    .max(20)
    .optional(),
  teachingStyle: z.string().max(2000).optional(),
  payout: z
    .object({ method: z.enum(['upi', 'bank']), encryptedDetails: z.string().min(1) })
    .optional(),
});

function completeness(profile: Record<string, unknown>): number {
  const checks = [
    Boolean(profile.headline),
    Boolean(profile.bio),
    Array.isArray(profile.subjects) && profile.subjects.length > 0,
    Number(profile.hourlyRatePaise) > 0,
    Array.isArray(profile.durations) && profile.durations.length > 0,
    Array.isArray(profile.languages) && profile.languages.length > 0,
    Boolean(profile.experienceYears),
    Array.isArray(profile.education) && profile.education.length > 0,
    Boolean(profile.introVideo && (profile.introVideo as { url?: string }).url),
    Boolean(profile.payout),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

async function getOrCreateProfile(userId: string, name: string) {
  let profile = await MentorProfile.findOne({ user: userId });
  if (!profile) {
    const slug = await generateUniqueSlug(name, async (candidate) =>
      Boolean(await MentorProfile.exists({ slug: candidate })),
    );
    profile = await MentorProfile.create({ user: userId, slug });
  }
  return profile;
}

router.use(authenticate, requireRole('mentor'));

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id).select('name timezone country');
    if (!user) throw ApiError.notFound('User not found');
    const profile = await getOrCreateProfile(req.user!.id, user.name);
    await profile.populate('subjects.subject', 'name slug');
    res.json({ success: true, data: profile });
  }),
);

router.put(
  '/profile',
  validate({ body: profileSchema }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id).select('name');
    if (!user) throw ApiError.notFound('User not found');
    const profile = await getOrCreateProfile(req.user!.id, user.name);
    const input = req.body as z.infer<typeof profileSchema>;
    if (input.subjects) {
      const subjectIds = input.subjects.map((item) => item.subject);
      const validCount = await Subject.countDocuments({ _id: { $in: subjectIds }, isActive: true });
      if (validCount !== subjectIds.length)
        throw ApiError.badRequest('One or more subjects are invalid');
    }
    Object.assign(profile, input);
    profile.completeness = completeness(profile.toObject());
    await profile.save();
    res.json({ success: true, data: profile });
  }),
);

router.post(
  '/profile/submit',
  asyncHandler(async (req, res) => {
    const profile = await MentorProfile.findOne({ user: req.user!.id });
    if (!profile) throw ApiError.badRequest('Create your mentor profile before submitting');
    profile.completeness = completeness(profile.toObject());
    if (profile.completeness < 70) {
      throw ApiError.unprocessable(
        'Complete at least 70% of your profile before submitting',
        'PROFILE_INCOMPLETE',
        {
          completeness: profile.completeness,
        },
      );
    }
    if (!profile.subjects.length || !profile.hourlyRatePaise) {
      throw ApiError.unprocessable('Add at least one subject and an hourly rate before submitting');
    }
    profile.status = 'pending';
    profile.rejectionReason = undefined;
    await profile.save();
    res.json({ success: true, data: profile });
  }),
);

router.post(
  '/profile/certificates',
  upload.single('certificate'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('A certificate file is required');
    assertUploadSize(
      req.file,
      req.file.mimetype === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024,
    );
    const name = z.string().min(2).max(160).parse(req.body.name);
    const issuer = z.string().min(2).max(160).parse(req.body.issuer);
    const year = z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .parse(req.body.year);
    const profile = await MentorProfile.findOne({ user: req.user!.id });
    if (!profile)
      throw ApiError.badRequest('Create your mentor profile before uploading certificates');
    const uploaded = await getStorageProvider().upload(
      req.file,
      `mentors/${req.user!.id}/certificates`,
    );
    profile.certifications.push({
      name,
      issuer,
      year,
      fileUrl: uploaded.url,
      filePublicId: uploaded.publicId,
    });
    profile.completeness = completeness(profile.toObject());
    await profile.save();
    res.status(201).json({ success: true, data: profile.certifications.at(-1) });
  }),
);

router.delete(
  '/profile/certificates/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const profile = await MentorProfile.findOne({ user: req.user!.id });
    if (!profile) throw ApiError.notFound('Mentor profile not found');
    const certificate = profile.certifications.id(req.params.id);
    if (!certificate) throw ApiError.notFound('Certificate not found');
    if (certificate.filePublicId) await getStorageProvider().delete(certificate.filePublicId);
    certificate.deleteOne();
    profile.completeness = completeness(profile.toObject());
    await profile.save();
    res.json({ success: true, data: null });
  }),
);

export default router;
