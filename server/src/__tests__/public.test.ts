import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { app } from '../app.js';

describe('public marketplace', () => {
  it('lists approved mentors and stores lead submissions', async () => {
    const category = await Category.create({
      name: 'Public Test',
      slug: `public-${Date.now()}`,
      icon: 'BookOpen',
    });
    const subject = await Subject.create({
      category: category._id,
      name: 'Public Subject',
      slug: `public-subject-${Date.now()}`,
    });
    const user = await User.create({
      name: 'Public Mentor',
      email: `public-${Date.now()}@test.dev`,
      role: 'mentor',
      passwordHash: await bcrypt.hash('Password@123', 12),
    });
    await MentorProfile.create({
      user: user._id,
      slug: `public-mentor-${Date.now()}`,
      headline: 'A helpful public mentor',
      bio: 'Clear and practical lessons.',
      status: 'approved',
      hourlyRatePaise: 70000,
      subjects: [{ subject: subject._id }],
      stats: { ratingAvg: 4.8, ratingCount: 12 },
    });
    const mentors = await request(app).get('/api/v1/mentors?q=helpful');
    expect(mentors.status).toBe(200);
    expect(mentors.body.data).toHaveLength(1);
    const lead = await request(app)
      .post('/api/v1/leads')
      .send({ name: 'Learner', phone: '9109447256', interest: 'Physics', source: 'no_results' });
    expect(lead.status).toBe(201);
  });
});
