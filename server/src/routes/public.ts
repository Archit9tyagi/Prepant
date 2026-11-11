import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Lead } from '../models/Lead.js';

const router = Router();

const mentorQuery = z.object({
  q: z.string().trim().max(100).optional(),
  subject: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(['recommended', 'price_asc', 'price_desc', 'rating', 'experience', 'reviews'])
    .default('recommended'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

function card(profile: any) {
  const user = profile.user as {
    _id: string;
    name: string;
    avatar?: { url?: string };
    country?: string;
  };
  return {
    slug: profile.slug,
    name: user.name,
    avatar: user.avatar?.url,
    headline: profile.headline,
    subjects: profile.subjects
      .map((item: { subject?: { name: string } }) => item.subject?.name)
      .filter(Boolean),
    ratingAvg: profile.stats.ratingAvg,
    ratingCount: profile.stats.ratingCount,
    sessionsTaught: profile.stats.sessionsTaught,
    hourlyRatePaise: profile.hourlyRatePaise,
    trialEnabled: profile.trialEnabled,
    badges: [...profile.badges, 'verified'],
    bio: profile.bio,
    languages: profile.languages,
    country: profile.country || user.country,
    timezone: profile.timezone,
    experienceYears: profile.experienceYears,
  };
}

router.get(
  '/mentors',
  validate({ query: mentorQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as z.infer<typeof mentorQuery>;
    const filter: Record<string, unknown> = { status: 'approved' };
    if (query.subject) filter['subjects.subject'] = query.subject;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.hourlyRatePaise = {
        ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
      };
    }
    if (query.rating !== undefined) filter['stats.ratingAvg'] = { $gte: query.rating };
    if (query.q) {
      const expression = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ headline: expression }, { bio: expression }];
    }
    const sort: Record<string, 1 | -1> =
      query.sort === 'price_asc'
        ? { hourlyRatePaise: 1 }
        : query.sort === 'price_desc'
          ? { hourlyRatePaise: -1 }
          : query.sort === 'rating'
            ? { 'stats.ratingAvg': -1 }
            : query.sort === 'experience'
              ? { experienceYears: -1 }
              : query.sort === 'reviews'
                ? { 'stats.ratingCount': -1 }
                : { searchBoost: -1, 'stats.ratingAvg': -1 };
    const [profiles, total] = await Promise.all([
      MentorProfile.find(filter)
        .populate('user', 'name avatar country')
        .populate('subjects.subject', 'name slug')
        .sort(sort)
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      MentorProfile.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: profiles.map(card),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }),
);

router.get(
  '/mentors/:slug',
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const profile = await MentorProfile.findOne({ slug: req.params.slug, status: 'approved' })
      .populate('user', 'name avatar country')
      .populate('subjects.subject', 'name slug')
      .lean();
    if (!profile) throw ApiError.notFound('Mentor not found');
    const detail = profile as any;
    res.json({
      success: true,
      data: {
        ...card(profile),
        education: detail.education,
        certifications: detail.certifications.map(
          ({
            filePublicId: _filePublicId,
            ...item
          }: {
            filePublicId?: string;
            [key: string]: unknown;
          }) => item,
        ),
        teachingStyle: detail.teachingStyle,
        workHistory: detail.workHistory,
        durations: detail.durations,
        introVideo: detail.introVideo,
      },
    });
  }),
);

router.post(
  '/leads',
  validate({
    body: z.object({
      name: z.string().min(2).max(120),
      phone: z.string().min(7).max(30),
      email: z.string().email().optional(),
      interest: z.string().min(2).max(160),
      message: z.string().max(2000).optional(),
      source: z.string().max(80).optional(),
      honeypot: z.string().max(0).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { honeypot, ...input } = req.body;
    if (honeypot) throw ApiError.badRequest('Invalid lead submission');
    const lead = await Lead.create(input);
    res
      .status(201)
      .json({
        success: true,
        data: { id: lead._id, message: 'Thanks. We will be in touch soon.' },
      });
  }),
);

export default router;
