import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Lead } from '../models/Lead.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [activeLearners, approvedMentors, sessionsDelivered, rating] = await Promise.all([
      User.countDocuments({ role: 'student', status: 'active', deletedAt: { $exists: false } }),
      MentorProfile.countDocuments({ status: 'approved' }),
      Booking.countDocuments({ status: 'completed' }),
      Review.aggregate([
        { $match: { status: 'visible' } },
        { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        activeLearners,
        approvedMentors,
        sessionsDelivered,
        averageRating: rating[0]?.average ?? null,
        reviewCount: rating[0]?.count ?? 0,
      },
    });
  }),
);

router.get(
  '/content/categories/:categorySlug',
  asyncHandler(async (req, res) => {
    const category = (await Category.findOne({
      slug: req.params.categorySlug,
      isActive: true,
    }).lean()) as any;
    if (!category) throw ApiError.notFound('Category not found');
    const subjects = await Subject.find({ category: category._id, isActive: true })
      .sort({ name: 1 })
      .lean();
    res.json({ success: true, data: { category, subjects } });
  }),
);

router.get(
  '/content/categories/:categorySlug/:subjectSlug',
  asyncHandler(async (req, res) => {
    const category = (await Category.findOne({
      slug: req.params.categorySlug,
      isActive: true,
    }).lean()) as any;
    const subject =
      category &&
      (await Subject.findOne({
        category: category._id,
        slug: req.params.subjectSlug,
        isActive: true,
      }).lean());
    if (!category || !subject) throw ApiError.notFound('Subject not found');
    res.json({ success: true, data: { category, subject } });
  }),
);

router.get(
  '/content/exams/:examSlug',
  asyncHandler(async (req, res) => {
    const examNames: Record<string, string> = {
      jee: 'JEE',
      neet: 'NEET',
      upsc: 'UPSC',
      ssc: 'SSC',
      cat: 'CAT',
      gate: 'GATE',
      cuet: 'CUET',
      boards: 'Boards',
    };
    const examSlug = String(req.params.examSlug);
    const name = examNames[examSlug.toLowerCase()];
    if (!name) throw ApiError.notFound('Exam not found');
    const subjects = await Subject.find({ tags: name, isActive: true }).sort({ name: 1 }).lean();
    res.json({ success: true, data: { slug: examSlug, name, subjects } });
  }),
);

router.get(
  '/posts',
  asyncHandler(async (_req, res) => {
    const posts = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(50)
      .select('-contentMarkdown')
      .lean();
    res.json({ success: true, data: posts });
  }),
);

router.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!post) throw ApiError.notFound('Post not found');
    res.json({ success: true, data: post });
  }),
);

router.get(
  '/settings/public',
  asyncHandler(async (_req, res) => {
    const record = (await (
      await import('../models/Setting.js')
    ).Setting.findOne({ key: 'booking' }).lean()) as any;
    res.json({
      success: true,
      data: record?.value ??
        record ?? {
          commissionPct: 20,
          trialDiscountPct: 50,
          slotStepMinutes: 30,
          holdMinutes: 10,
          cancellationWindowHours: 12,
        },
    });
  }),
);

const mentorQuery = z.object({
  q: z.string().trim().max(100).optional(),
  subject: z.string().optional(),
  category: z.string().optional(),
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
    mentorId: user._id.toString(),
    slug: profile.slug,
    name: user.name,
    avatar: user.avatar?.url,
    headline: profile.headline,
    subjects: profile.subjects
      .map((item: { subject?: { name: string } }) => item.subject?.name)
      .filter(Boolean),
    subjectIds: profile.subjects
      .map((item: { subject?: { _id?: unknown } }) => item.subject?._id?.toString())
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
    if (query.category) {
      const category = await Category.findOne({ slug: query.category, isActive: true }).select(
        '_id',
      );
      const subjects = category
        ? await Subject.find({ category: category._id, isActive: true }).select('_id')
        : [];
      filter['subjects.subject'] = { $in: subjects.map((subject) => subject._id) };
    }
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

router.get(
  '/mentors/:slug/similar',
  asyncHandler(async (req, res) => {
    const profile = (await MentorProfile.findOne({
      slug: req.params.slug,
      status: 'approved',
    }).lean()) as any;
    if (!profile) throw ApiError.notFound('Mentor not found');
    const similar = await MentorProfile.find({
      _id: { $ne: profile._id },
      status: 'approved',
      'subjects.subject': {
        $in: profile.subjects.map((item: { subject: unknown }) => item.subject),
      },
    })
      .populate('user', 'name avatar country')
      .populate('subjects.subject', 'name slug')
      .limit(4)
      .lean();
    res.json({ success: true, data: similar.map(card) });
  }),
);

router.get(
  '/mentors/:slug/reviews',
  validate({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  }),
  asyncHandler(async (req, res) => {
    const profile = (await MentorProfile.findOne({
      slug: req.params.slug,
      status: 'approved',
    }).lean()) as any;
    if (!profile) throw ApiError.notFound('Mentor not found');
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Review.find({ mentor: profile.user, status: 'visible' })
        .populate('student', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Review.countDocuments({ mentor: profile.user, status: 'visible' }),
    ]);
    res.json({
      success: true,
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
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
    res.status(201).json({
      success: true,
      data: { id: lead._id, message: 'Thanks. We will be in touch soon.' },
    });
  }),
);

export default router;
