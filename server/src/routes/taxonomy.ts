import { Router } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: categories });
  }),
);

router.get(
  '/categories/:slug',
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!category) throw ApiError.notFound('Category not found');
    res.json({ success: true, data: category });
  }),
);

router.get(
  '/subjects',
  validate({
    query: z.object({
      category: z.string().optional(),
      q: z.string().trim().max(100).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(50),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { category, q, page, limit } = req.query as unknown as {
      category?: string;
      q?: string;
      page: number;
      limit: number;
    };
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (q) {
      const expression = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: expression }, { aliases: expression }, { tags: expression }];
    }
    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .populate('category', 'name slug')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subject.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: subjects,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

router.get(
  '/subjects/:slug',
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const subject = await Subject.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .lean();
    if (!subject) throw ApiError.notFound('Subject not found');
    res.json({ success: true, data: subject });
  }),
);

export default router;
