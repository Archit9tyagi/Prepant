import { Router } from 'express';
import { z } from 'zod';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Booking } from '../models/Booking.js';
import { SlotLock } from '../models/SlotLock.js';
import { Payment } from '../models/Payment.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Availability } from '../models/Availability.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { Review } from '../models/Review.js';
import { Setting } from '../models/Setting.js';
import { getPaymentProvider, getVideoProvider } from '../providers/index.js';
import { localRangesForDate } from './availability.js';
import { calculatePlatformFee } from '../utils/money.js';

const router = Router();
const createSchema = z.object({
  mentorSlug: z.string().min(1),
  subject: z.string().min(1),
  startAt: z.string().datetime(),
  durationMins: z.number().int().min(30).max(180),
  type: z.enum(['trial', 'single', 'pack']).default('single'),
  goals: z.string().max(2000).optional(),
  level: z.string().max(80).optional(),
});
const idParams = z.object({ id: z.string().min(1) });

router.get(
  '/slots',
  validate({
    query: z.object({
      mentorSlug: z.string(),
      from: z.string(),
      to: z.string(),
      duration: z.coerce.number().int().min(30).max(180).default(30),
      tz: z.string().default('Asia/Kolkata'),
    }),
  }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as {
      mentorSlug: string;
      from: string;
      to: string;
      duration: number;
      tz: string;
    };
    const profile = (await MentorProfile.findOne({
      slug: query.mentorSlug,
      status: 'approved',
    }).lean()) as any;
    if (!profile) throw ApiError.notFound('Mentor not found');
    const availability = (await Availability.findOne({ mentor: profile.user }).lean()) as any;
    if (!availability) return res.json({ success: true, data: {} });
    const result: Record<string, string[]> = {};
    let date = DateTime.fromISO(query.from, { zone: query.tz }).startOf('day');
    const endDate = DateTime.fromISO(query.to, { zone: query.tz }).startOf('day');
    while (date <= endDate) {
      const key = date.toISODate()!;
      const slots: string[] = [];
      for (const range of localRangesForDate(availability, date)) {
        let cursor = DateTime.fromISO(`${key}T${range.start}`, { zone: availability.timezone });
        const rangeEnd = DateTime.fromISO(`${key}T${range.end}`, { zone: availability.timezone });
        while (cursor.plus({ minutes: query.duration + availability.bufferMinutes }) <= rangeEnd) {
          const start = cursor.toUTC().toJSDate();
          const finish = cursor.plus({ minutes: query.duration }).toUTC().toJSDate();
          const earliest = DateTime.utc().plus({ hours: availability.minNoticeHours });
          const latest = DateTime.utc().plus({ days: availability.maxAdvanceDays });
          if (cursor.toUTC() >= earliest && cursor.toUTC() <= latest) {
            const locked = await SlotLock.exists({
              mentor: profile.user,
              slotStart: { $gte: start, $lt: finish },
            });
            if (!locked) slots.push(cursor.setZone(query.tz).toISO()!);
          }
          cursor = cursor.plus({ minutes: 30 });
        }
      }
      result[key] = slots;
      date = date.plus({ days: 1 });
    }
    res.json({ success: true, data: result });
  }),
);

router.use(authenticate);

router.post(
  '/',
  requireRole('student'),
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof createSchema>;
    const profile = (await MentorProfile.findOne({
      slug: input.mentorSlug,
      status: 'approved',
    })) as any;
    if (!profile) throw ApiError.notFound('Mentor not found');
    const mentor = await User.findById(profile.user);
    if (!mentor) throw ApiError.notFound('Mentor not found');
    if (!(await Subject.exists({ _id: input.subject, isActive: true })))
      throw ApiError.badRequest('Subject not found');
    const availability = (await Availability.findOne({ mentor: profile.user }).lean()) as any;
    const start = DateTime.fromISO(input.startAt, { setZone: true });
    if (!start.isValid) throw ApiError.badRequest('Invalid session time');
    const end = start.plus({ minutes: input.durationMins });
    const existingTrial =
      input.type === 'trial' &&
      (await Booking.exists({
        student: req.user!.id,
        mentor: profile.user,
        type: 'trial',
        status: { $nin: ['cancelled_by_student', 'cancelled_by_mentor', 'expired'] },
      }));
    if (existingTrial)
      throw ApiError.conflict('Trial session already used with this mentor', 'TRIAL_ALREADY_USED');
    if (!availability)
      throw ApiError.conflict('Mentor has no availability configured', 'NO_AVAILABILITY');
    const settingRecord = (await Setting.findOne({ key: 'booking' }).lean()) as any;
    const setting = settingRecord?.value ?? settingRecord;
    const trialDiscount = setting?.trialDiscountPct ?? 50;
    const commissionPct = setting?.commissionPct ?? 20;
    const base = Math.round((profile.hourlyRatePaise * input.durationMins) / 60);
    const discount = input.type === 'trial' ? Math.round((base * trialDiscount) / 100) : 0;
    const amount = base - discount;
    const fee = calculatePlatformFee(amount, commissionPct);
    const booking = await Booking.create({
      student: req.user!.id,
      mentor: profile.user,
      mentorProfile: profile._id,
      subject: input.subject,
      startAt: start.toUTC().toJSDate(),
      endAt: end.toUTC().toJSDate(),
      durationMins: input.durationMins,
      type: input.type,
      price: {
        amountPaise: amount,
        discountPaise: discount,
        platformFeePaise: fee,
        mentorEarningPaise: amount - fee,
        currency: 'INR',
      },
      holdExpiresAt: new Date(Date.now() + (setting?.holdMinutes ?? 10) * 60_000),
      goals: input.goals,
      level: input.level,
    });
    try {
      const grainCount = Math.ceil((input.durationMins + availability.bufferMinutes) / 15);
      const locks = Array.from({ length: grainCount }, (_, index) => ({
        mentor: profile.user,
        slotStart: start
          .plus({ minutes: index * 15 })
          .toUTC()
          .toJSDate(),
        booking: booking._id,
      }));
      await SlotLock.insertMany(locks, { ordered: true });
    } catch (error) {
      await SlotLock.deleteMany({ booking: booking._id });
      await Booking.deleteOne({ _id: booking._id });
      if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000)
        throw ApiError.conflict('That slot was just taken', 'SLOT_TAKEN');
      throw error;
    }
    const order = await getPaymentProvider().createOrder({
      amountPaise: amount,
      currency: 'INR',
      receipt: booking._id.toString(),
    });
    const payment = await Payment.create({
      booking: booking._id,
      student: req.user!.id,
      provider: 'mock',
      orderId: order.orderId,
      amountPaise: amount,
      currency: 'INR',
    });
    booking.payment = payment._id;
    await booking.save();
    res.status(201).json({ success: true, data: { booking, order } });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter =
      req.user!.role === 'mentor' ? { mentor: req.user!.id } : { student: req.user!.id };
    const bookings = await Booking.find(filter)
      .populate('subject', 'name slug')
      .sort({ startAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: bookings });
  }),
);

router.get(
  '/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ student: req.user!.id }, { mentor: req.user!.id }],
    })
      .populate('subject', 'name slug')
      .lean();
    if (!booking) throw ApiError.notFound('Booking not found');
    res.json({ success: true, data: booking });
  }),
);

router.post(
  '/:id/verify',
  requireRole('student'),
  validate({
    params: idParams,
    body: z.object({ paymentId: z.string().min(1), signature: z.string().default('') }),
  }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user!.id });
    if (!booking || !booking.payment) throw ApiError.notFound('Booking not found');
    const payment = await Payment.findById(booking.payment);
    if (!payment) throw ApiError.notFound('Payment not found');
    if (payment.status !== 'captured') {
      if (
        !getPaymentProvider().verifySignature({
          orderId: payment.orderId,
          paymentId: req.body.paymentId,
          signature: req.body.signature,
        })
      )
        throw ApiError.badRequest('Invalid payment signature');
      payment.status = 'captured';
      payment.paymentId = req.body.paymentId;
      await payment.save();
      booking.status = 'confirmed';
      booking.holdExpiresAt = undefined;
      booking.meeting = await getVideoProvider().createRoom(booking._id.toString());
      await booking.save();
      await LedgerEntry.create({
        mentor: booking.mentor,
        booking: booking._id,
        type: 'earning',
        amountPaise: booking.price.mentorEarningPaise,
        status: 'pending',
        availableAt: new Date(Date.now() + 24 * 60 * 60_000),
      });
    }
    res.json({ success: true, data: booking });
  }),
);

router.post(
  '/:id/cancel',
  validate({ params: idParams, body: z.object({ reason: z.string().max(500).optional() }) }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ student: req.user!.id }, { mentor: req.user!.id }],
    });
    if (!booking || !['confirmed', 'pending_payment'].includes(booking.status))
      throw ApiError.notFound('Cancellable booking not found');
    const byStudent = booking.student.toString() === req.user!.id;
    if (!byStudent && booking.mentor.toString() !== req.user!.id)
      throw ApiError.forbidden('You cannot cancel this booking');
    const windowHours = ((await Setting.findOne().lean()) as any)?.cancellationWindowHours ?? 12;
    const refund =
      byStudent && booking.startAt.getTime() - Date.now() >= windowHours * 3600000
        ? booking.price.amountPaise
        : 0;
    booking.status = byStudent ? 'cancelled_by_student' : 'cancelled_by_mentor';
    booking.cancel = {
      by: byStudent ? 'student' : 'mentor',
      reason: req.body.reason,
      at: new Date(),
      refundPaise: refund,
    };
    await booking.save();
    await SlotLock.deleteMany({ booking: booking._id });
    if (refund && booking.payment) {
      const payment = await Payment.findById(booking.payment);
      if (payment?.paymentId) {
        const result = await getPaymentProvider().refund(
          payment.paymentId,
          refund,
          'booking cancellation',
        );
        payment.status = 'refunded';
        payment.refunds.push({
          refundId: result.refundId,
          amountPaise: refund,
          reason: 'booking cancellation',
          at: new Date(),
        });
        await payment.save();
      }
    }
    res.json({ success: true, data: booking });
  }),
);

router.post(
  '/:id/complete',
  requireRole('mentor'),
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      mentor: req.user!.id,
      status: 'confirmed',
    });
    if (!booking) throw ApiError.notFound('Active booking not found');
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();
    await LedgerEntry.updateOne(
      { booking: booking._id, type: 'earning' },
      { $set: { status: 'available' } },
    );
    res.json({ success: true, data: booking });
  }),
);

router.get(
  '/:id/join',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ student: req.user!.id }, { mentor: req.user!.id }],
      status: { $in: ['confirmed', 'completed'] },
    });
    if (!booking) throw ApiError.notFound('Booking not found');
    const now = Date.now();
    if (
      now < booking.startAt.getTime() - 10 * 60_000 ||
      now > booking.endAt.getTime() + 30 * 60_000
    )
      throw ApiError.forbidden('The classroom is not open yet');
    const role = booking.student.toString() === req.user!.id ? 'student' : 'mentor';
    booking.attendance = { ...(booking.attendance ?? {}), [`${role}JoinedAt`]: new Date() };
    await booking.save();
    res.json({ success: true, data: booking.meeting });
  }),
);

router.post(
  '/:id/review',
  requireRole('student'),
  validate({
    params: idParams,
    body: z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
      tags: z.array(z.string().max(50)).max(10).default([]),
    }),
  }),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      student: req.user!.id,
      status: 'completed',
    });
    if (!booking) throw ApiError.badRequest('Only completed sessions can be reviewed');
    if (await Review.exists({ booking: booking._id }))
      throw ApiError.conflict('This session has already been reviewed');
    const review = await Review.create({
      booking: booking._id,
      student: req.user!.id,
      mentor: booking.mentor,
      ...req.body,
    });
    const aggregate = await Review.aggregate([
      { $match: { mentor: booking.mentor, status: 'visible' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await MentorProfile.updateOne(
      { user: booking.mentor },
      {
        $set: {
          'stats.ratingAvg': aggregate[0]?.average ?? 0,
          'stats.ratingCount': aggregate[0]?.count ?? 0,
        },
      },
    );
    res.status(201).json({ success: true, data: review });
  }),
);

export default router;
