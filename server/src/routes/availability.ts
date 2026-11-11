import { Router } from 'express';
import { z } from 'zod';
import { DateTime } from 'luxon';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Availability } from '../models/Availability.js';
import { User } from '../models/User.js';

const router = Router();
const range = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});
const availabilitySchema = z.object({
  timezone: z.string().min(1).max(80),
  weekly: z
    .array(
      z.object({ dayOfWeek: z.number().int().min(0).max(6), start: z.string(), end: z.string() }),
    )
    .max(50),
  exceptions: z
    .array(
      z.object({
        date: z.string(),
        type: z.enum(['off', 'custom']),
        ranges: z.array(range).default([]),
      }),
    )
    .max(100)
    .default([]),
  bufferMinutes: z
    .enum(['0', '15', '30'])
    .or(
      z
        .number()
        .int()
        .refine((value) => [0, 15, 30].includes(value)),
    )
    .transform(Number)
    .default(0),
  minNoticeHours: z.number().int().min(0).max(168).default(12),
  maxAdvanceDays: z.number().int().min(1).max(180).default(60),
});

router.use(authenticate, requireRole('mentor'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const availability = await Availability.findOne({ mentor: req.user!.id }).lean();
    res.json({ success: true, data: availability ?? null });
  }),
);

router.put(
  '/',
  validate({ body: availabilitySchema }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound('User not found');
    const availability = await Availability.findOneAndUpdate(
      { mentor: user._id },
      { $set: req.body },
      { upsert: true, new: true, runValidators: true },
    );
    res.json({ success: true, data: availability });
  }),
);

router.post(
  '/exceptions',
  validate({
    body: z.object({
      date: z.string(),
      type: z.enum(['off', 'custom']),
      ranges: z.array(range).default([]),
    }),
  }),
  asyncHandler(async (req, res) => {
    const availability = await Availability.findOne({ mentor: req.user!.id });
    if (!availability) throw ApiError.notFound('Availability has not been configured');
    availability.exceptions = availability.exceptions.filter(
      (item: { date: string }) => item.date !== req.body.date,
    );
    availability.exceptions.push(req.body);
    await availability.save();
    res.status(201).json({ success: true, data: availability });
  }),
);

export default router;

export function localRangesForDate(
  availability: {
    timezone: string;
    weekly: Array<{ dayOfWeek: number; start: string; end: string }>;
    exceptions: Array<{
      date: string;
      type: string;
      ranges: Array<{ start: string; end: string }>;
    }>;
  },
  date: DateTime,
) {
  const localDate = date.setZone(availability.timezone);
  const exception = availability.exceptions.find((item) => item.date === localDate.toISODate());
  if (exception) return exception.type === 'off' ? [] : exception.ranges;
  return availability.weekly.filter((item) => item.dayOfWeek === localDate.weekday % 7);
}
