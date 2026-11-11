import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();
const profileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional(),
  timezone: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
});
const userView = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  timezone: user.timezone,
  country: user.country,
  phone: user.phone,
  emailVerifiedAt: user.emailVerifiedAt,
});

router.patch(
  '/me',
  authenticate,
  validate({ body: profileSchema }),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!user) throw ApiError.notFound('User not found');
    res.json({ success: true, data: userView(user) });
  }),
);
router.delete(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound('User not found');
    user.name = 'Deleted user';
    user.email = `deleted-${user._id}@deleted.prepant`;
    user.phone = undefined;
    user.passwordHash = await bcrypt.hash(Math.random().toString(36), 12);
    user.deletedAt = new Date();
    user.status = 'blocked';
    await user.save();
    await RefreshToken.updateMany(
      { user: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    res.json({ success: true, data: null });
  }),
);

export default router;
