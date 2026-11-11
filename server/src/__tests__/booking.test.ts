import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { DateTime } from 'luxon';
import bcrypt from 'bcryptjs';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Availability } from '../models/Availability.js';
import { Booking } from '../models/Booking.js';
import { env } from '../config/env.js';

describe('availability and booking', () => {
  it('generates a slot, creates a mock-paid booking and prevents duplicate locks', async () => {
    const category = await Category.create({
      name: 'Booking Test',
      slug: `booking-${Date.now()}`,
      icon: 'BookOpen',
    });
    const subject = await Subject.create({
      category: category._id,
      name: 'Booking Subject',
      slug: `booking-subject-${Date.now()}`,
    });
    const mentor = await User.create({
      name: 'Booking Mentor',
      email: `mentor-${Date.now()}@test.dev`,
      role: 'mentor',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const student = await User.create({
      name: 'Booking Student',
      email: `student-${Date.now()}@test.dev`,
      role: 'student',
      passwordHash: await bcrypt.hash('Password@123', 10),
    });
    const profile = await MentorProfile.create({
      user: mentor._id,
      slug: `booking-mentor-${Date.now()}`,
      status: 'approved',
      hourlyRatePaise: 100000,
      subjects: [{ subject: subject._id }],
    });
    const target = DateTime.utc()
      .plus({ days: 2 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
    await Availability.create({
      mentor: mentor._id,
      timezone: 'UTC',
      weekly: [{ dayOfWeek: target.weekday % 7, start: '09:00', end: '18:00' }],
      minNoticeHours: 1,
      maxAdvanceDays: 30,
    });
    const slots = await request(app)
      .get('/api/v1/bookings/slots')
      .query({
        mentorSlug: profile.slug,
        from: target.toISODate(),
        to: target.toISODate(),
        duration: 30,
        tz: 'UTC',
      });
    expect(slots.status).toBe(200);
    expect(slots.body.data[target.toISODate()]).toContain(target.toISO());
    const token = jwt.sign(
      { sub: student._id.toString(), role: 'student', email: student.email },
      env.JWT_ACCESS_SECRET,
    );
    const payload = {
      mentorSlug: profile.slug,
      subject: subject._id.toString(),
      startAt: target.toISO(),
      durationMins: 30,
      type: 'trial',
    };
    const first = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(first.status).toBe(201);
    const second = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(second.status).toBe(409);
    const verify = await request(app)
      .post(`/api/v1/bookings/${first.body.data.booking._id}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentId: 'mock-payment', signature: '' });
    expect(verify.status).toBe(200);
    expect(verify.body.data.status).toBe('confirmed');
    expect(await Booking.countDocuments({ student: student._id })).toBe(1);
  });
});
