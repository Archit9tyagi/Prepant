import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { env } from '../config/env.js';
import { AuditLog } from '../models/AuditLog.js';
import { Lead } from '../models/Lead.js';
import { Post } from '../models/Post.js';

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

  it('supports admin controls, filtered lead export and audits mutations', async () => {
    const admin = await User.create({
      name: 'Control Admin',
      email: `control-admin-${Date.now()}@test.dev`,
      role: 'admin',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const student = await User.create({
      name: 'Control Student',
      email: `control-student-${Date.now()}@test.dev`,
      role: 'student',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    await Lead.create({
      name: 'Lead Person',
      phone: '+911234567890',
      email: 'lead@test.dev',
      interest: 'Physics',
    });
    const token = jwt.sign(
      { sub: admin._id.toString(), role: admin.role, email: admin.email },
      env.JWT_ACCESS_SECRET,
    );
    const blocked = await request(app)
      .patch(`/api/v1/admin/users/${student._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'blocked' });
    expect(blocked.status).toBe(200);
    expect(blocked.body.data.status).toBe('blocked');

    const leads = await request(app)
      .get('/api/v1/admin/leads?status=new&q=lead')
      .set('Authorization', `Bearer ${token}`);
    expect(leads.status).toBe(200);
    expect(leads.body.data).toHaveLength(1);

    const csv = await request(app)
      .get('/api/v1/admin/leads.csv')
      .set('Authorization', `Bearer ${token}`);
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain('Lead Person');

    expect(
      await AuditLog.exists({ actor: admin._id, action: 'user.blocked', entityId: student._id }),
    ).toBeTruthy();
  });

  it('audits CMS and settings mutations', async () => {
    const admin = await User.create({
      name: 'CMS Admin',
      email: `cms-admin-${Date.now()}@test.dev`,
      role: 'admin',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const token = jwt.sign(
      { sub: admin._id.toString(), role: admin.role, email: admin.email },
      env.JWT_ACCESS_SECRET,
    );
    const created = await request(app)
      .post('/api/v1/admin/blog')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Admin post', slug: `admin-post-${Date.now()}`, contentMarkdown: '# Hello' });
    expect(created.status).toBe(201);
    const postId = created.body.data._id;
    expect(
      await request(app)
        .patch(`/api/v1/admin/blog/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'published' }),
    ).toHaveProperty('status', 200);
    expect(
      await request(app)
        .patch('/api/v1/admin/settings/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ value: { commissionPercent: 20 } }),
    ).toHaveProperty('status', 200);
    expect(await Post.exists({ _id: postId, status: 'published' })).toBeTruthy();
    expect(await AuditLog.countDocuments({ actor: admin._id })).toBeGreaterThanOrEqual(3);
  });
});
