import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { getEmailProvider } from '../providers/index.js';
import { emailTemplates } from '../providers/email/templates.js';

const router = Router();
const password = z.string().min(8);
const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password,
  role: z.enum(['student', 'mentor']),
  consent: z.literal(true),
  timezone: z.string().optional(),
});
const loginSchema = z.object({ email: z.string().email(), password });
const tokenSchema = z.object({ token: z.string().min(16) });
const cookieName = 'prepant_refresh';

function publicUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    timezone: user.timezone,
    country: user.country,
    phone: user.phone,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}
function accessToken(user: any) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'] },
  );
}
function setRefreshCookie(res: any, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400000,
    path: '/api/v1/auth',
  });
}
async function issueRefresh(user: any, req: any, res: any, familyId = generateToken(16)) {
  const raw = generateToken();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(raw),
    familyId,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000),
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  setRefreshCookie(res, raw);
}
async function issueSession(user: any, req: any, res: any) {
  await issueRefresh(user, req, res);
  return { accessToken: accessToken(user), user: publicUser(user) };
}
async function sendVerification(user: any) {
  const raw = generateToken();
  user.emailVerificationTokenHash = hashToken(raw);
  user.emailVerificationExpiresAt = new Date(Date.now() + 86400000);
  await user.save();
  await getEmailProvider().send({
    to: user.email,
    ...emailTemplates.verify(user.name, `${env.CLIENT_URL}/verify-email/${raw}`),
  });
}

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    if (await User.exists({ email: body.email.toLowerCase(), deletedAt: { $exists: false } }))
      throw ApiError.conflict('An account with this email already exists', 'EMAIL_EXISTS');
    const user = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: await bcrypt.hash(body.password, 12),
      role: body.role,
      timezone: body.timezone || 'Asia/Kolkata',
    });
    await sendVerification(user);
    res.status(201).json({ success: true, data: await issueSession(user, req, res) });
  }),
);
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({
      email: body.email.toLowerCase(),
      deletedAt: { $exists: false },
    });
    if (!user || !user.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash)))
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    if (user.status !== 'active') throw ApiError.forbidden('This account is unavailable');
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ success: true, data: await issueSession(user, req, res) });
  }),
);
router.post(
  '/google',
  authLimiter,
  validate({
    body: z.object({
      idToken: z.string().min(10),
      role: z.enum(['student', 'mentor']).default('student'),
    }),
  }),
  asyncHandler(async (req, res) => {
    if (!env.GOOGLE_CLIENT_ID)
      throw ApiError.badRequest('Google sign-in is not configured', 'GOOGLE_NOT_CONFIGURED');
    const ticket = await new OAuth2Client(env.GOOGLE_CLIENT_ID).verifyIdToken({
      idToken: req.body.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw ApiError.unauthorized('Google account email is unavailable');
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user)
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: req.body.role,
        emailVerifiedAt: new Date(),
      });
    res.json({ success: true, data: await issueSession(user, req, res) });
  }),
);
router.post(
  '/refresh',
  validate({ headers: z.object({ 'x-requested-with': z.literal('prepant-web') }) }),
  asyncHandler(async (req, res) => {
    const raw = req.cookies[cookieName];
    if (!raw) throw ApiError.unauthorized('Refresh token missing');
    const token = await RefreshToken.findOne({ tokenHash: hashToken(raw) });
    if (!token) throw ApiError.unauthorized('Invalid refresh token');
    if (token.revokedAt) {
      await RefreshToken.updateMany(
        { familyId: token.familyId, revokedAt: { $exists: false } },
        { revokedAt: new Date() },
      );
      throw ApiError.unauthorized('Refresh token reuse detected', 'REFRESH_REUSE');
    }
    if (token.expiresAt < new Date()) throw ApiError.unauthorized('Refresh token expired');
    const user = await User.findById(token.user);
    if (!user) throw ApiError.unauthorized('User not found');
    const rawNext = generateToken();
    const next = await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(rawNext),
      familyId: token.familyId,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000),
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
    token.revokedAt = new Date();
    token.replacedBy = next._id.toString();
    await token.save();
    setRefreshCookie(res, rawNext);
    res.json({ success: true, data: { accessToken: accessToken(user), user: publicUser(user) } });
  }),
);
router.post(
  '/logout',
  validate({ headers: z.object({ 'x-requested-with': z.literal('prepant-web') }) }),
  asyncHandler(async (req, res) => {
    const raw = req.cookies[cookieName];
    if (raw)
      await RefreshToken.updateOne(
        { tokenHash: hashToken(raw), revokedAt: { $exists: false } },
        { revokedAt: new Date() },
      );
    res.clearCookie(cookieName, { path: '/api/v1/auth' });
    res.json({ success: true, data: null });
  }),
);
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound('User not found');
    res.json({ success: true, data: publicUser(user) });
  }),
);
router.post(
  '/verify-email',
  validate({ body: tokenSchema }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(req.body.token),
      emailVerificationExpiresAt: { $gt: new Date() },
    });
    if (!user)
      throw ApiError.badRequest('Verification link is invalid or expired', 'INVALID_TOKEN');
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();
    res.json({ success: true, data: publicUser(user) });
  }),
);
router.post(
  '/resend-verification',
  authLimiter,
  validate({ body: z.object({ email: z.string().email() }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user && !user.emailVerifiedAt) await sendVerification(user);
    res.json({
      success: true,
      data: { message: 'If the account exists, a verification email has been sent.' },
    });
  }),
);
router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: z.object({ email: z.string().email() }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      const raw = generateToken();
      user.passwordResetTokenHash = hashToken(raw);
      user.passwordResetExpiresAt = new Date(Date.now() + 3600000);
      await user.save();
      await getEmailProvider().send({
        to: user.email,
        ...emailTemplates.reset(`${env.CLIENT_URL}/reset-password/${raw}`),
      });
    }
    res.json({
      success: true,
      data: { message: 'If the account exists, a reset link has been sent.' },
    });
  }),
);
router.post(
  '/reset-password',
  validate({ body: z.object({ token: z.string().min(16), password }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(req.body.token),
      passwordResetExpiresAt: { $gt: new Date() },
    });
    if (!user) throw ApiError.badRequest('Reset link is invalid or expired', 'INVALID_TOKEN');
    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await RefreshToken.updateMany(
      { user: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    await user.save();
    res.json({ success: true, data: null });
  }),
);
router.post(
  '/change-password',
  authenticate,
  validate({ body: z.object({ currentPassword: password, newPassword: password }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user?.passwordHash || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash)))
      throw ApiError.badRequest('Current password is incorrect', 'INVALID_PASSWORD');
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    await RefreshToken.updateMany(
      { user: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    res.json({ success: true, data: null });
  }),
);

export default router;
