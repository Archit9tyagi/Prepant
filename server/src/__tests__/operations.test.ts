import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { env } from '../config/env.js';

describe('operations dashboards', () => {
  it('protects role-specific dashboards and serves admin statistics', async () => {
    const mentor = await User.create({
      name: 'Ops Mentor',
      email: `ops-mentor-${Date.now()}@test.dev`,
      role: 'mentor',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const admin = await User.create({
      name: 'Ops Admin',
      email: `ops-admin-${Date.now()}@test.dev`,
      role: 'admin',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    await MentorProfile.create({ user: mentor._id, slug: `ops-${Date.now()}`, status: 'approved' });
    const access = (user: typeof mentor) =>
      jwt.sign(
        { sub: user._id.toString(), role: user.role, email: user.email },
        env.JWT_ACCESS_SECRET,
      );
    expect(
      (
        await request(app)
          .get('/api/v1/mentor/dashboard')
          .set('Authorization', `Bearer ${access(mentor)}`)
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .get('/api/v1/admin/stats')
          .set('Authorization', `Bearer ${access(admin)}`)
      ).body.data.users,
    ).toBeGreaterThanOrEqual(2);
    expect(
      (
        await request(app)
          .get('/api/v1/admin/stats')
          .set('Authorization', `Bearer ${access(mentor)}`)
      ).status,
    ).toBe(403);
  });
});
