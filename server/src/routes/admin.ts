import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { getEmailProvider } from '../providers/index.js';
import { emailTemplates } from '../providers/email/templates.js';

const router = Router();
const idParams = z.object({ id: z.string().min(1) });
const reasonBody = z.object({ reason: z.string().min(5).max(1000) });
const categoryBody = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  icon: z.string().min(1).max(80),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  seo: z
    .object({ title: z.string().max(160).optional(), description: z.string().max(320).optional() })
    .optional(),
});
const subjectBody = z.object({
  category: z.string().min(1),
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180).optional(),
  aliases: z.array(z.string().max(160)).optional(),
  levels: z.array(z.string().max(80)).optional(),
  tags: z.array(z.string().max(80)).optional(),
  isActive: z.boolean().optional(),
  seo: z
    .object({ title: z.string().max(160).optional(), description: z.string().max(320).optional() })
    .optional(),
});

router.use(authenticate, requireRole('admin'));

async function audit(
  req: { user?: { id: string }; ip?: string },
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await AuditLog.create({
    actor: req.user!.id,
    action,
    entityType,
    entityId,
    metadata,
    ip: req.ip,
  });
}

router.get(
  '/mentors',
  validate({
    query: z.object({
      status: z.enum(['draft', 'pending', 'approved', 'rejected', 'suspended']).default('pending'),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(25),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query as unknown as {
      status: string;
      page: number;
      limit: number;
    };
    const filter = { status };
    const [profiles, total] = await Promise.all([
      MentorProfile.find(filter)
        .populate('user', 'name email avatar timezone')
        .populate('subjects.subject', 'name slug')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MentorProfile.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: profiles,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

async function updateMentorStatus(
  req: import('express').Request,
  res: { json: (body: unknown) => void },
  status: 'approved' | 'rejected' | 'suspended',
  reason?: string,
) {
  const profile = await MentorProfile.findById(req.params.id).populate('user', 'name email');
  if (!profile) throw ApiError.notFound('Mentor profile not found');
  if (status === 'rejected' || status === 'suspended') profile.rejectionReason = reason;
  else profile.rejectionReason = undefined;
  profile.status = status;
  await profile.save();
  await audit(req, `mentor.${status}`, 'MentorProfile', profile._id.toString(), { reason });
  const user = profile.user as unknown as { name: string; email: string };
  if (status === 'approved' || status === 'rejected') {
    const message =
      status === 'approved'
        ? emailTemplates.mentorApproved(user.name)
        : emailTemplates.mentorRejected(
            user.name,
            reason || 'Please review your profile and resubmit.',
          );
    await getEmailProvider().send({ to: user.email, ...message });
  }
  res.json({ success: true, data: profile });
}

router.post(
  '/mentors/:id/approve',
  validate({ params: idParams }),
  asyncHandler((req, res) => updateMentorStatus(req, res, 'approved')),
);
router.post(
  '/mentors/:id/reject',
  validate({ params: idParams, body: reasonBody }),
  asyncHandler((req, res) => updateMentorStatus(req, res, 'rejected', req.body.reason)),
);
router.post(
  '/mentors/:id/suspend',
  validate({ params: idParams, body: reasonBody }),
  asyncHandler((req, res) => updateMentorStatus(req, res, 'suspended', req.body.reason)),
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await Category.find().sort({ order: 1, name: 1 }).lean() });
  }),
);
router.post(
  '/categories',
  validate({ body: categoryBody }),
  asyncHandler(async (req, res) => {
    const body = categoryBody.parse(req.body);
    const slug = await generateUniqueSlug(body.slug || body.name, async (candidate) =>
      Boolean(await Category.exists({ slug: candidate })),
    );
    const category = await Category.create({ ...body, slug });
    await audit(req, 'category.created', 'Category', category._id.toString());
    res.status(201).json({ success: true, data: category });
  }),
);
router.patch(
  '/categories/:id',
  validate({ params: idParams, body: categoryBody.partial() }),
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!category) throw ApiError.notFound('Category not found');
    await audit(req, 'category.updated', 'Category', category._id.toString());
    res.json({ success: true, data: category });
  }),
);
router.delete(
  '/categories/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!category) throw ApiError.notFound('Category not found');
    await audit(req, 'category.archived', 'Category', category._id.toString());
    res.json({ success: true, data: category });
  }),
);

router.get(
  '/subjects',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: await Subject.find().populate('category', 'name slug').sort({ name: 1 }).lean(),
    });
  }),
);
router.post(
  '/subjects',
  validate({ body: subjectBody }),
  asyncHandler(async (req, res) => {
    const body = subjectBody.parse(req.body);
    if (!(await Category.exists({ _id: body.category })))
      throw ApiError.badRequest('Category not found');
    const slug = await generateUniqueSlug(body.slug || body.name, async (candidate) =>
      Boolean(await Subject.exists({ slug: candidate })),
    );
    const subject = await Subject.create({ ...body, slug });
    await audit(req, 'subject.created', 'Subject', subject._id.toString());
    res.status(201).json({ success: true, data: subject });
  }),
);
router.patch(
  '/subjects/:id',
  validate({ params: idParams, body: subjectBody.partial() }),
  asyncHandler(async (req, res) => {
    if (req.body.category && !(await Category.exists({ _id: req.body.category })))
      throw ApiError.badRequest('Category not found');
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!subject) throw ApiError.notFound('Subject not found');
    await audit(req, 'subject.updated', 'Subject', subject._id.toString());
    res.json({ success: true, data: subject });
  }),
);
router.delete(
  '/subjects/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!subject) throw ApiError.notFound('Subject not found');
    await audit(req, 'subject.archived', 'Subject', subject._id.toString());
    res.json({ success: true, data: subject });
  }),
);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: [] });
  }),
);

export default router;
