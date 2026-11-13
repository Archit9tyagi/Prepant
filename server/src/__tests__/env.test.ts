import { describe, expect, it } from 'vitest';
import { parseEnv } from '../config/env.js';

const productionBase = {
  NODE_ENV: 'production',
  CLIENT_URL: 'https://prepant.example',
  SERVER_URL: 'https://api.prepant.example',
  JWT_ACCESS_SECRET: 'a'.repeat(48),
  JWT_REFRESH_SECRET: 'b'.repeat(48),
  ENCRYPTION_KEY: 'c'.repeat(64),
  COOKIE_SECURE: 'true',
};

describe('parseEnv', () => {
  it('rejects production without MONGODB_URI', () => {
    expect(() => parseEnv(productionBase)).toThrow(/MONGODB_URI.*Render Environment tab/);
  });

  it.each([
    'mongodb://127.0.0.1:27017/prepant',
    'mongodb://localhost:27017/prepant',
    'http://db.example',
  ])('rejects production MongoDB URI %s', (MONGODB_URI) => {
    expect(() => parseEnv({ ...productionBase, MONGODB_URI })).toThrow(/MONGODB_URI/);
  });

  it('keeps the local MongoDB default outside production', () => {
    expect(parseEnv({ NODE_ENV: 'development' }).MONGODB_URI).toBe(
      'mongodb://127.0.0.1:27017/prepant',
    );
    expect(parseEnv({ NODE_ENV: 'test' }).MONGODB_URI).toBe('mongodb://127.0.0.1:27017/prepant');
  });
});
