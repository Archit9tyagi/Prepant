import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Health API', () => {
  it('GET /api/v1/health should return 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('GET /api/v1/unknown-route should return 404', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });

  it('GET /api/v1/ready should report database readiness', async () => {
    const res = await request(app).get('/api/v1/ready');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: { status: 'ready', database: 'connected' },
    });
  });

  it('adds a request id to responses', async () => {
    const res = await request(app).get('/api/v1/health').set('x-request-id', 'test-request-id');

    expect(res.headers['x-request-id']).toBe('test-request-id');
  });

  it('sets security headers and only allows the configured client origin', async () => {
    const allowed = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:5173');
    const denied = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://unexpected.example');

    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
