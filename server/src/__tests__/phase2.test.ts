import request from 'supertest';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { MentorProfile } from '../models/MentorProfile.js';

const headers = { 'X-Requested-With': 'prepant-web' };

async function login(email: string, password: string) {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .set(headers)
    .send({ email, password });
  expect(response.status).toBe(200);
  return response.body.data.accessToken as string;
}

describe('Phase 2 taxonomy and mentor approval', () => {
  it('serves active categories and subjects publicly', async () => {
    const category = await Category.create({ name: 'Coding', slug: 'coding', icon: 'Code' });
    await Subject.create({
      category: category._id,
      name: 'Python',
      slug: 'python',
      tags: ['programming'],
    });

    const categories = await request(app).get('/api/v1/categories');
    expect(categories.status).toBe(200);
    expect(categories.body.data.some((item: { slug: string }) => item.slug === 'coding')).toBe(
      true,
    );

    const subjects = await request(app).get('/api/v1/subjects?q=Python');
    expect(subjects.status).toBe(200);
    expect(subjects.body.data[0].slug).toBe('python');
  });

  it('lets a mentor save, submit and upload onboarding data', async () => {
    const mentorEmail = `mentor-${Date.now()}@test.dev`;
    await User.create({
      name: 'Phase Two Mentor',
      email: mentorEmail,
      passwordHash: await bcrypt.hash('Password@123', 12),
      role: 'mentor',
      emailVerifiedAt: new Date(),
    });
    const category = await Category.create({
      name: 'Languages',
      slug: `languages-${Date.now()}`,
      icon: 'Languages',
    });
    const subject = await Subject.create({
      category: category._id,
      name: 'English',
      slug: `english-${Date.now()}`,
    });
    const token = await login(mentorEmail, 'Password@123');

    const saved = await request(app)
      .put('/api/v1/mentor/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        headline: 'English mentor for confident communication',
        bio: 'I teach through practical conversations and structured feedback.',
        introVideo: { provider: 'youtube', url: 'https://youtube.com/watch?v=example' },
        subjects: [{ subject: subject._id.toString(), levels: ['beginner'], boards: [] }],
        hourlyRatePaise: 90000,
        durations: [30, 60],
        trialEnabled: true,
        languages: [{ code: 'en', level: 'native' }],
        experienceYears: 5,
        education: [{ degree: 'BA English', institution: 'Test University', year: 2020 }],
        payout: { method: 'upi', encryptedDetails: 'encrypted-test-value' },
      });
    expect(saved.status).toBe(200);
    expect(saved.body.data.completeness).toBeGreaterThanOrEqual(70);

    const submitted = await request(app)
      .post('/api/v1/mentor/profile/submit')
      .set('Authorization', `Bearer ${token}`);
    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe('pending');

    const certificate = await request(app)
      .post('/api/v1/mentor/profile/certificates')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Teaching Certificate')
      .field('issuer', 'Test Board')
      .field('year', '2022')
      .attach('certificate', Buffer.from('%PDF-1.4 test certificate'), 'certificate.pdf');
    expect(certificate.status).toBe(201);
    expect(certificate.body.data.fileUrl).toContain('/uploads/');
  });

  it('restricts approval to admins and records an approval audit entry', async () => {
    const mentorEmail = `approval-mentor-${Date.now()}@test.dev`;
    const adminEmail = `approval-admin-${Date.now()}@test.dev`;
    const passwordHash = await bcrypt.hash('Password@123', 12);
    const mentor = await User.create({
      name: 'Approval Mentor',
      email: mentorEmail,
      passwordHash,
      role: 'mentor',
    });
    await User.create({ name: 'Approval Admin', email: adminEmail, passwordHash, role: 'admin' });
    const profile = await MentorProfile.create({
      user: mentor._id,
      slug: `approval-mentor-${Date.now()}`,
      status: 'pending',
    });
    const mentorToken = await login(mentorEmail, 'Password@123');
    const forbidden = await request(app)
      .post(`/api/v1/admin/mentors/${profile._id}/approve`)
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(forbidden.status).toBe(403);

    const adminToken = await login(adminEmail, 'Password@123');
    const approved = await request(app)
      .post(`/api/v1/admin/mentors/${profile._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('approved');
    expect(
      await AuditLog.exists({ action: 'mentor.approved', entityId: profile._id }),
    ).toBeTruthy();
  });
});
