import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { env } from '../config/env.js';

describe('community features', () => {
  it('saves favorites, sends messages and tracks notifications/read state', async () => {
    const mentor = await User.create({
      name: 'Community Mentor',
      email: `community-mentor-${Date.now()}@test.dev`,
      role: 'mentor',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const student = await User.create({
      name: 'Community Student',
      email: `community-student-${Date.now()}@test.dev`,
      role: 'student',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    await MentorProfile.create({
      user: mentor._id,
      slug: `community-${Date.now()}`,
      status: 'approved',
      hourlyRatePaise: 50000,
    });
    const token = (user: typeof student) =>
      jwt.sign(
        { sub: user._id.toString(), role: user.role, email: user.email },
        env.JWT_ACCESS_SECRET,
      );
    const studentHeaders = { Authorization: `Bearer ${token(student)}` };
    const favorite = await request(app).post(`/api/v1/favorites/${mentor._id}`).set(studentHeaders);
    expect(favorite.status).toBe(201);
    expect(
      (await request(app).get('/api/v1/favorites').set(studentHeaders)).body.data,
    ).toHaveLength(1);
    const conversation = await request(app)
      .post('/api/v1/conversations')
      .set(studentHeaders)
      .send({ participantId: mentor._id.toString() });
    expect(conversation.status).toBe(201);
    const conversationId = conversation.body.data._id;
    const message = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set(studentHeaders)
      .send({ body: 'Hello mentor' });
    expect(message.status).toBe(201);
    const mentorHeaders = { Authorization: `Bearer ${token(mentor)}` };
    expect(
      (await request(app).get('/api/v1/notifications').set(mentorHeaders)).body.data,
    ).toHaveLength(1);
    expect(
      (
        await request(app)
          .get(`/api/v1/conversations/${conversationId}/messages`)
          .set(mentorHeaders)
      ).body.data[0].body,
    ).toBe('Hello mentor');
    expect(
      (await request(app).post(`/api/v1/conversations/${conversationId}/read`).set(mentorHeaders))
        .status,
    ).toBe(200);
  });
});
