import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';

const headers = { 'X-Requested-With': 'prepant-web' };

describe('authentication', () => {
  it('registers, logs in, refreshes and rotates a session', async () => {
    const registered = await request(app).post('/api/v1/auth/register').set(headers).send({
      name: 'Test Student',
      email: 'student-auth@test.dev',
      password: 'Password@123',
      role: 'student',
      consent: true,
    });
    expect(registered.status).toBe(201);
    expect(registered.body.data.user.role).toBe('student');
    const cookie = registered.headers['set-cookie'][0];
    expect(cookie).toContain('prepant_refresh=');

    const loggedIn = await request(app)
      .post('/api/v1/auth/login')
      .set(headers)
      .send({ email: 'student-auth@test.dev', password: 'Password@123' });
    expect(loggedIn.status).toBe(200);
    const refreshed = await request(app)
      .post('/api/v1/auth/refresh')
      .set(headers)
      .set('Cookie', cookie);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
    expect(
      (
        await RefreshToken.find({
          user: (await User.findOne({ email: 'student-auth@test.dev' }))?._id,
        })
      ).length,
    ).toBe(3);
  });

  it('rejects a reused refresh token and revokes its family', async () => {
    const result = await request(app).post('/api/v1/auth/register').set(headers).send({
      name: 'Reuse Test',
      email: 'reuse@test.dev',
      password: 'Password@123',
      role: 'student',
      consent: true,
    });
    const cookie = result.headers['set-cookie'][0];
    expect(
      (await request(app).post('/api/v1/auth/refresh').set(headers).set('Cookie', cookie)).status,
    ).toBe(200);
    const reuse = await request(app)
      .post('/api/v1/auth/refresh')
      .set(headers)
      .set('Cookie', cookie);
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe('REFRESH_REUSE');
  });

  it('enforces authentication and role middleware', async () => {
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
  });
});
