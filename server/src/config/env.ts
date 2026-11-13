import { z } from 'zod';

const mongoLocalUri = 'mongodb://127.0.0.1:27017/prepant';
const developmentDefaults = {
  CLIENT_URL: 'http://localhost:5173',
  SERVER_URL: 'http://localhost:5000',
  JWT_ACCESS_SECRET: 'prepant-access-secret-minimum-32-chars-long-123',
  JWT_REFRESH_SECRET: 'prepant-refresh-secret-minimum-32-chars-long-123',
  ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(10000),
  CLIENT_URL: z.string().optional(),
  SERVER_URL: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  MONGODB_URI: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().positive().default(30),
  COOKIE_DOMAIN: z.string().optional().default(''),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  ENCRYPTION_KEY: z.string().optional(),
  PAYMENTS_MODE: z.enum(['mock', 'razorpay']).default('mock'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('Prepant <no-reply@prepant.com>'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  SENTRY_DSN: z.string().optional().default(''),
});

type RawEnv = Record<string, unknown>;

function isLocalMongoHost(uri: string): boolean {
  try {
    const host = new URL(uri).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

function isValidMongoUri(uri: string): boolean {
  return (
    (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) && !isLocalMongoHost(uri)
  );
}

function validateProductionValues(values: z.infer<typeof envSchema>): string[] {
  if (values.NODE_ENV !== 'production') return [];

  const missing = [
    'MONGODB_URI',
    'CLIENT_URL',
    'SERVER_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
  ].filter((name) => {
    const value = values[name as keyof typeof values];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  const errors = missing.map((name) => `${name} is required`);
  if (values.MONGODB_URI && !isValidMongoUri(values.MONGODB_URI)) {
    errors.push('MONGODB_URI must be a non-local mongodb:// or mongodb+srv:// URI');
  }

  const clientOrigins = values.CLIENT_URL?.split(',').map((origin) => origin.trim()) ?? [];
  if (
    clientOrigins.some((origin) => {
      try {
        const parsed = new URL(origin);
        return !['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return true;
      }
    })
  ) {
    errors.push('CLIENT_URL must contain comma-separated http:// or https:// origins');
  }

  if (values.COOKIE_SECURE !== true) errors.push('COOKIE_SECURE must be true');
  if (values.PAYMENTS_MODE === 'razorpay') {
    for (const name of [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
    ] as const) {
      if (!values[name].trim()) errors.push(`${name} is required when PAYMENTS_MODE=razorpay`);
    }
  }
  if (
    [values.CLOUDINARY_CLOUD_NAME, values.CLOUDINARY_API_KEY, values.CLOUDINARY_API_SECRET].some(
      (value) => value.trim(),
    ) &&
    [values.CLOUDINARY_CLOUD_NAME, values.CLOUDINARY_API_KEY, values.CLOUDINARY_API_SECRET].some(
      (value) => !value.trim(),
    )
  ) {
    errors.push(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set together',
    );
  }
  if (
    [values.SMTP_HOST, values.SMTP_USER, values.SMTP_PASS].some((value) => value.trim()) &&
    [values.SMTP_HOST, values.SMTP_USER, values.SMTP_PASS].some((value) => !value.trim())
  ) {
    errors.push('SMTP_HOST, SMTP_USER and SMTP_PASS must be set together');
  }
  return errors;
}

export function parseEnv(raw: RawEnv = process.env) {
  const nodeEnv = raw.NODE_ENV ?? 'development';
  const defaults = nodeEnv === 'production' ? {} : developmentDefaults;
  const parsed = envSchema.safeParse({
    ...defaults,
    ...raw,
    MONGODB_URI: raw.MONGODB_URI ?? (nodeEnv === 'production' ? undefined : mongoLocalUri),
  });

  if (!parsed.success) {
    throw new Error(
      `Environment configuration error: ${parsed.error.issues
        .map((issue) => issue.path.join('.') || issue.message)
        .join(', ')}. Set these values in the Render Environment tab.`,
    );
  }

  const productionErrors = validateProductionValues(parsed.data);
  if (productionErrors.length > 0) {
    throw new Error(
      `Environment configuration error: ${productionErrors.join('; ')}. Set these values in the Render Environment tab.`,
    );
  }

  return {
    ...parsed.data,
    CLIENT_URL: parsed.data.CLIENT_URL ?? developmentDefaults.CLIENT_URL,
    SERVER_URL: parsed.data.SERVER_URL ?? developmentDefaults.SERVER_URL,
    MONGODB_URI: parsed.data.MONGODB_URI ?? mongoLocalUri,
    JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET ?? developmentDefaults.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET ?? developmentDefaults.JWT_REFRESH_SECRET,
    ENCRYPTION_KEY: parsed.data.ENCRYPTION_KEY ?? developmentDefaults.ENCRYPTION_KEY,
  };
}

export const env = parseEnv();
export type Env = ReturnType<typeof parseEnv>;
