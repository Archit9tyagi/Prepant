import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { upload, assertUploadSize } from '../middleware/upload.js';
import { getStorageProvider } from '../providers/index.js';

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
    router.post(
      '/me/avatar',
      authenticate,
      upload.single('avatar'),
      asyncHandler(async (req, res) => {
        if (!req.file) throw ApiError.badRequest('Profile photo is required', 'FILE_REQUIRED');
        if (!req.file.mimetype.startsWith('image/'))
          throw ApiError.badRequest('Profile photo must be an image', 'INVALID_FILE_TYPE');
        assertUploadSize(req.file, 5 * 1024 * 1024);
        const user = await User.findById(req.user!.id);
        if (!user) throw ApiError.notFound('User not found');
        if (user.avatar?.publicId) await getStorageProvider().delete(user.avatar.publicId);
        const uploaded = await getStorageProvider().upload(req.file, `users/${user._id}/avatar`);
        user.avatar = uploaded;
        await user.save();
        res.json({ success: true, data: userView(user) });
      }),
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
