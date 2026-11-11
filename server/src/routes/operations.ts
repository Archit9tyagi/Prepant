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
import { getPaymentProvider } from '../providers/index.js';

const router = Router();
const idParams = z.object({ id: z.string().min(1) });
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
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
      (await import('../models/MentorProfile.js')).MentorProfile.findOne({ user: req.user!.id })
        .select('completeness stats status')
        .lean(),
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
    const [users, mentors, bookings, captured] = await Promise.all([
      User.countDocuments({ deletedAt: { $exists: false } }),
      User.countDocuments({ role: 'mentor', deletedAt: { $exists: false } }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, totalPaise: { $sum: '$amountPaise' } } },
      ]),
    ]);
    res.json({
      success: true,
      data: { users, mentors, bookings, gmvPaise: captured[0]?.totalPaise ?? 0 },
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

router.get(
  '/admin/bookings',
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Booking.find()
        .sort({ startAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('student mentor subject', 'name email')
        .lean(),
      Booking.countDocuments(),
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
    await AuditLog.create({
      actor: req.user!.id,
      action: 'payment.refunded',
      entityType: 'Payment',
      entityId: payment._id,
      metadata: { amountPaise: amount },
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
    await AuditLog.create({
      actor: req.user!.id,
      action: 'payout.paid',
      entityType: 'Payout',
      entityId: payout._id,
      metadata: { reference: req.body.reference },
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
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as { page: number; limit: number };
    const [data, total] = await Promise.all([
      Lead.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Lead.countDocuments(),
    ]);
    res.json({
      success: true,
      data,
      meta: { ...query, total, totalPages: Math.ceil(total / query.limit) },
    });
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
  '/admin/settings/:key',
  validate({
    params: z.object({ key: z.string().min(1) }),
    body: z.object({ value: z.record(z.unknown()) }),
  }),
  asyncHandler(async (req, res) => {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value, updatedBy: req.user!.id },
      { upsert: true, new: true },
    );
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
