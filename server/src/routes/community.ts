import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Favorite } from '../models/Favorite.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { emitToConversation, emitToUser } from '../realtime.js';

const router = Router();
const idParams = z.object({ id: z.string().min(1) });

router.use((req, res, next) => {
  const protectedPrefix = ['/favorites', '/conversations', '/notifications'];
  if (protectedPrefix.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`))) {
    return authenticate(req, res, next);
  }
  next();
});

router.get(
  '/favorites',
  asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ student: req.user!.id })
      .populate({ path: 'mentor', select: 'name avatar country' })
      .lean();
    res.json({ success: true, data: favorites });
  }),
);

router.post(
  '/favorites/:mentorId',
  validate({ params: z.object({ mentorId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const mentor = await User.findOne({
      _id: req.params.mentorId,
      role: 'mentor',
      status: 'active',
    });
    if (!mentor || !(await MentorProfile.exists({ user: mentor._id, status: 'approved' })))
      throw ApiError.notFound('Mentor not found');
    const favorite = await Favorite.findOneAndUpdate(
      { student: req.user!.id, mentor: mentor._id },
      { $setOnInsert: { student: req.user!.id, mentor: mentor._id } },
      { upsert: true, new: true },
    );
    res.status(201).json({ success: true, data: favorite });
  }),
);

router.delete(
  '/favorites/:mentorId',
  validate({ params: z.object({ mentorId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    await Favorite.deleteOne({ student: req.user!.id, mentor: req.params.mentorId });
    res.json({ success: true, data: null });
  }),
);

async function findConversation(userId: string, otherId: string) {
  return Conversation.findOne({ participants: { $all: [userId, otherId], $size: 2 } });
}

router.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user!.id })
      .populate('participants', 'name avatar role')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: conversations });
  }),
);

router.post(
  '/conversations',
  validate({ body: z.object({ participantId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    if (req.body.participantId === req.user!.id)
      throw ApiError.badRequest('You cannot message yourself');
    const other = await User.findById(req.body.participantId).select('name avatar role');
    if (!other) throw ApiError.notFound('Participant not found');
    const conversation =
      (await findConversation(req.user!.id, other._id.toString())) ??
      (await Conversation.create({ participants: [req.user!.id, other._id] }));
    await conversation.populate('participants', 'name avatar role');
    res.status(201).json({ success: true, data: conversation });
  }),
);

router.get(
  '/conversations/:id/messages',
  validate({
    params: idParams,
    query: z.object({
      before: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(30),
    }),
  }),
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user!.id,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const query = req.query as unknown as { before?: string; limit: number };
    const filter: Record<string, unknown> = { conversation: conversation._id };
    if (query.before) filter.createdAt = { $lt: new Date(query.before) };
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .populate('sender', 'name avatar')
      .lean();
    res.json({ success: true, data: messages.reverse() });
  }),
);

router.post(
  '/conversations/:id/messages',
  validate({
    params: idParams,
    body: z.object({
      body: z.string().trim().min(1).max(2000),
      attachments: z
        .array(z.object({ url: z.string().url(), name: z.string(), type: z.string() }))
        .max(5)
        .default([]),
    }),
  }),
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user!.id,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!.id,
      body: req.body.body,
      attachments: req.body.attachments,
    });
    const recipient = conversation.participants.find(
      (participant: mongoose.Types.ObjectId) => participant.toString() !== req.user!.id,
    );
    const recipientUser = recipient && (await User.findById(recipient).select('role'));
    const recipientRole = recipientUser?.role === 'mentor' ? 'mentor' : 'student';
    conversation.lastMessage = {
      text: message.body,
      at: message.createdAt,
      sender: message.sender,
    };
    conversation.unread = {
      ...(conversation.unread ?? {}),
      [recipientRole]: (conversation.unread?.[recipientRole] ?? 0) + 1,
    };
    await conversation.save();
    await message.populate('sender', 'name avatar');
    emitToConversation(conversation._id.toString(), 'message:new', message);
    if (recipient)
      emitToUser(
        recipient.toString(),
        'notification:new',
        await Notification.create({
          user: recipient,
          type: 'message',
          title: 'New message',
          body: message.body.slice(0, 120),
          link: `/app/messages/${conversation._id}`,
        }),
      );
    res.status(201).json({ success: true, data: message });
  }),
);

router.post(
  '/conversations/:id/read',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user!.id,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user!.id }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    );
    const user = await User.findById(req.user!.id).select('role');
    const key = user?.role === 'mentor' ? 'mentor' : 'student';
    conversation.unread = { ...(conversation.unread ?? {}), [key]: 0 };
    await conversation.save();
    emitToConversation(conversation._id.toString(), 'message:read', { userId: req.user!.id });
    res.json({ success: true, data: null });
  }),
);

router.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: notifications });
  }),
);

router.post(
  '/notifications/read-all',
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { user: req.user!.id, readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    );
    res.json({ success: true, data: null });
  }),
);

export default router;
