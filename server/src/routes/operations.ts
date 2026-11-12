import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { Payout } from '../models/Payout.js';
import { Review } from '../models/Review.js';
import { Lead } from '../models/Lead.js';
import { Post } from '../models/Post.js';
import { Setting } from '../models/Setting.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { getPaymentProvider } from '../providers/index.js';

const router = Router();
const idParams = z.object({ id: z.string().min(1) });
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
const auditMutation = async (
  actor: string,
  action: string,
  entityType: string,
  entityId: unknown,
  metadata?: Record<string, unknown>,
) =>
  AuditLog.create({
    actor,
    action,
    entityType,
    entityId,
    ...(metadata ? { metadata } : {}),
  });

router.get(
  '/mentor/dashboard',
  authenticate,
  requireRole('mentor'),
  asyncHandler(async (req, res) => {
    const now = new Date();
    const [today, upcoming, earnings, profile] = await Promise.all([
      Booking.countDocuments({
        mentor: req.user!.id,
        startAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      }),
      Booking.find({ mentor: req.user!.id, status: 'confirmed', startAt: { $gte: new Date() } })
        .sort({ startAt: 1 })
        .limit(5)
        .populate('student', 'name')
        .lean(),
      LedgerEntry.aggregate([
        { $match: { mentor: req.user!.id } },
        { $group: { _id: '$status', totalPaise: { $sum: '$amountPaise' } } },
      ]),
      MentorProfile.findOne({ user: req.user!.id }).select('completeness stats status').lean(),
    ]);
    res.json({ success: true, data: { todaySessions: today, upcoming, earnings, profile } });
  }),
);

router.get(
  '/mentor/students',
  authenticate,
  requireRole('mentor'),
  asyncHandler(async (req, res) => {
    const students = await Booking.aggregate([
      { $match: { mentor: req.user!.id } },
      { $group: { _id: '$student', sessions: { $sum: 1 }, lastSessionAt: { $max: '$startAt' } } },
      { $sort: { lastSessionAt: -1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $project: { sessions: 1, lastSessionAt: 1, 'student.name': 1, 'student.email': 1 } },
    ]);
    res.json({ success: true, data: students });
  }),
);

router.get(
  '/mentor/earnings',
  authenticate,
  requireRole('mentor'),
  asyncHandler(async (req, res) => {
    const entries = await LedgerEntry.find({ mentor: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('booking', 'startAt type')
      .lean();
    const totals = await LedgerEntry.aggregate([
      { $match: { mentor: req.user!.id } },
      { $group: { _id: '$status', totalPaise: { $sum: '$amountPaise' } } },
    ]);
    res.json({ success: true, data: { entries, totals } });
  }),
);

router.get(
  '/mentor/payouts',
  authenticate,
  requireRole('mentor'),
  asyncHandler(async (req, res) => {
    const payouts = await Payout.find({ mentor: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: payouts });
  }),
);

router.post(
  '/mentor/payouts',
  authenticate,
  requireRole('mentor'),
  validate({ body: z.object({ amountPaise: z.number().int().positive().max(100000000) }) }),
  asyncHandler(async (req, res) => {
    const setting = (await Setting.findOne({ key: 'booking' }).lean()) as {
      value?: { minPayoutPaise?: number };
    } | null;
    const minimum = setting?.value?.minPayoutPaise ?? 50000;
    if (req.body.amountPaise < minimum)
      throw ApiError.unprocessable(`Minimum payout is ${minimum} paise`, 'PAYOUT_BELOW_MINIMUM');
    const available = await LedgerEntry.aggregate([
      { $match: { mentor: req.user!.id, status: 'available' } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]);
    if ((available[0]?.total ?? 0) < req.body.amountPaise)
      throw ApiError.unprocessable('Insufficient available balance', 'INSUFFICIENT_BALANCE');
    const payout = await Payout.create({ mentor: req.user!.id, amountPaise: req.body.amountPaise });
    res.status(201).json({ success: true, data: payout });
  }),
);

router.post(
  '/mentor/reviews/:id/reply',
  authenticate,
  requireRole('mentor'),
  validate({ params: idParams, body: z.object({ text: z.string().trim().min(2).max(1000) }) }),
  asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, mentor: req.user!.id });
    if (!review) throw ApiError.notFound('Review not found');
    review.mentorReply = { text: req.body.text, at: new Date() };
    await review.save();
    res.json({ success: true, data: review });
  }),
);

router.use('/admin', authenticate, requireRole('admin'));

router.get(
  '/admin/stats',
  asyncHandler(async (_req, res) => {
    const [users, mentors, bookings, captured, funnel, series] = await Promise.all([
      User.countDocuments({ deletedAt: { $exists: false } }),
      User.countDocuments({ role: 'mentor', deletedAt: { $exists: false } }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, totalPaise: { $sum: '$amountPaise' } } },
      ]),
      MentorProfile.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Booking.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            bookings: { $sum: 1 },
            gmvPaise: { $sum: '$price.amountPaise' },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        users,
        mentors,
        bookings,
        gmvPaise: captured[0]?.totalPaise ?? 0,
        mentorFunnel: funnel,
        bookingsByDay: series.reverse(),
      },
    });
  }),
);

router.get(
  '/admin/users',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      User.find({ deletedAt: { $exists: false } })
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      User.countDocuments({ deletedAt: { $exists: false } }),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.patch(
  '/admin/users/:id/status',
  validate({
    params: idParams,
    body: z.object({ status: z.enum(['active', 'blocked']) }),
  }),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.id) throw ApiError.badRequest('You cannot block yourself');
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $exists: false } },
      { status: req.body.status },
      { new: true, projection: '-passwordHash' },
    );
    if (!user) throw ApiError.notFound('User not found');
    await auditMutation(req.user!.id, `user.${req.body.status}`, 'User', user._id);
    res.json({ success: true, data: user });
  }),
);

router.get(
  '/admin/bookings',
  validate({
    query: pageQuery.extend({
      status: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number; status?: string };
    const filter = query.status ? { status: query.status } : {};
    const [data, total] = await Promise.all([
      Booking.find(filter)
        .sort({ startAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('student mentor subject', 'name email')
        .lean(),
      Booking.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.get(
  '/admin/payments',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Payment.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Payment.countDocuments(),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.post(
  '/admin/payments/:id/refund',
  validate({
    params: idParams,
    body: z.object({
      amountPaise: z.number().int().positive().optional(),
      reason: z.string().max(500).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment || !payment.paymentId) throw ApiError.notFound('Captured payment not found');
    const amount = req.body.amountPaise ?? payment.amountPaise;
    const result = await getPaymentProvider().refund(payment.paymentId, amount, req.body.reason);
    payment.status = amount === payment.amountPaise ? 'refunded' : 'partially_refunded';
    payment.refunds.push({
      refundId: result.refundId,
      amountPaise: amount,
      reason: req.body.reason,
      at: new Date(),
    });
    await payment.save();
    await auditMutation(req.user!.id, 'payment.refunded', 'Payment', payment._id, {
      amountPaise: amount,
    });
    res.json({ success: true, data: payment });
  }),
);

router.get(
  '/admin/payouts',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Payout.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('mentor', 'name email')
        .lean(),
      Payout.countDocuments(),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.post(
  '/admin/payouts/:id/pay',
  validate({ params: idParams, body: z.object({ reference: z.string().min(2).max(120) }) }),
  asyncHandler(async (req, res) => {
    const payout = await Payout.findOneAndUpdate(
      { _id: req.params.id, status: 'requested' },
      { $set: { status: 'paid', reference: req.body.reference, processedAt: new Date() } },
      { new: true },
    );
    if (!payout) throw ApiError.notFound('Requested payout not found');
    await LedgerEntry.updateMany(
      { mentor: payout.mentor, status: 'available' },
      { $set: { status: 'paid' } },
    );
    await auditMutation(req.user!.id, 'payout.paid', 'Payout', payout._id, {
      reference: req.body.reference,
    });
    res.json({ success: true, data: payout });
  }),
);

router.post(
  '/admin/payouts/:id/reject',
  validate({ params: idParams, body: z.object({ note: z.string().min(2).max(500) }) }),
  asyncHandler(async (req, res) => {
    const payout = await Payout.findOneAndUpdate(
      { _id: req.params.id, status: 'requested' },
      { $set: { status: 'rejected', note: req.body.note, processedAt: new Date() } },
      { new: true },
    );
    if (!payout) throw ApiError.notFound('Requested payout not found');
    await auditMutation(req.user!.id, 'payout.rejected', 'Payout', payout._id, {
      note: req.body.note,
    });
    res.json({ success: true, data: payout });
  }),
);

router.get(
  '/admin/reviews',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Review.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('student mentor', 'name email')
        .lean(),
      Review.countDocuments(),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.patch(
  '/admin/reviews/:id',
  validate({ params: idParams, body: z.object({ status: z.enum(['visible', 'hidden']) }) }),
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!review) throw ApiError.notFound('Review not found');
    await AuditLog.create({
      actor: req.user!.id,
      action: `review.${req.body.status}`,
      entityType: 'Review',
      entityId: review._id,
    });
    res.json({ success: true, data: review });
  }),
);

router.get(
  '/admin/leads',
  validate({
    query: pageQuery.extend({
      status: z.enum(['new', 'contacted', 'closed']).optional(),
      q: z.string().trim().max(100).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      status?: 'new' | 'contacted' | 'closed';
      q?: string;
    };
    const filter = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? { $or: [{ name: new RegExp(query.q, 'i') }, { email: new RegExp(query.q, 'i') }] }
        : {}),
    };
    const [data, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

router.get(
  '/admin/leads.csv',
  asyncHandler(async (_req, res) => {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['name', 'phone', 'email', 'interest', 'status', 'createdAt'],
      ...leads.map((lead) => [
        lead.name,
        lead.phone,
        lead.email,
        lead.interest,
        lead.status,
        lead.createdAt.toISOString(),
      ]),
    ];
    res
      .type('text/csv')
      .setHeader('Content-Disposition', 'attachment; filename="prepant-leads.csv"')
      .send(rows.map((row) => row.map(escape).join(',')).join('\n'));
  }),
);

router.patch(
  '/admin/leads/:id',
  validate({
    params: idParams,
    body: z.object({ status: z.enum(['new', 'contacted', 'closed']) }),
  }),
  asyncHandler(async (req, res) => {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!lead) throw ApiError.notFound('Lead not found');
    await auditMutation(req.user!.id, `lead.${req.body.status}`, 'Lead', lead._id);
    res.json({ success: true, data: lead });
  }),
);

router.get(
  '/admin/blog',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await Post.find().sort({ updatedAt: -1 }).lean() });
  }),
);

router.post(
  '/admin/blog',
  validate({
    body: z.object({
      title: z.string().min(2).max(180),
      slug: z.string().min(2).max(180),
      excerpt: z.string().max(500).optional(),
      contentMarkdown: z.string().min(1),
      tags: z.array(z.string()).default([]),
      status: z.enum(['draft', 'published']).default('draft'),
      seo: z
        .object({ title: z.string().optional(), description: z.string().optional() })
        .optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const post = await Post.create({
      ...req.body,
      author: req.user!.id,
      publishedAt: req.body.status === 'published' ? new Date() : undefined,
    });
    res.status(201).json({ success: true, data: post });
  }),
);

router.patch(
  '/admin/blog/:id',
  validate({
    params: idParams,
    body: z.object({
      title: z.string().min(2).max(180).optional(),
      excerpt: z.string().max(500).optional(),
      contentMarkdown: z.string().min(1).optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['draft', 'published']).optional(),
      seo: z
        .object({ title: z.string().optional(), description: z.string().optional() })
        .optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.status === 'published' ? { publishedAt: new Date() } : {}),
      },
      { new: true, runValidators: true },
    );
    if (!post) throw ApiError.notFound('Post not found');
    await auditMutation(req.user!.id, 'post.updated', 'Post', post._id);
    res.json({ success: true, data: post });
  }),
);

router.delete(
  '/admin/blog/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) throw ApiError.notFound('Post not found');
    await auditMutation(req.user!.id, 'post.deleted', 'Post', post._id);
    res.json({ success: true, data: { id: post._id } });
  }),
);

router.patch(
  '/admin/settings/:key',
  validate({
    params: z.object({ key: z.string().min(1) }),
    body: z.object({ value: z.record(z.string(), z.unknown()) }),
  }),
  asyncHandler(async (req, res) => {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value, updatedBy: req.user!.id },
      { upsert: true, new: true },
    );
    await auditMutation(req.user!.id, 'setting.updated', 'Setting', setting._id, {
      key: req.params.key,
    });
    res.json({ success: true, data: setting });
  }),
);

router.get(
  '/admin/audit',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('actor', 'name email')
        .lean(),
      AuditLog.countDocuments(),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
  }),
);

export default router;
