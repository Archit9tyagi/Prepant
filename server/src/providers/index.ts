import type { PaymentProvider } from './payment/types.js';
import { MockPaymentProvider } from './payment/mock.js';
import type { EmailProvider } from './email/types.js';
import { ConsoleEmailProvider } from './email/console.js';
import { SmtpEmailProvider } from './email/smtp.js';
import { env } from '../config/env.js';
import type { StorageProvider } from './storage/types.js';
import { LocalStorageProvider } from './storage/local.js';
import type { VideoProvider } from './video/types.js';
import { JitsiVideoProvider } from './video/jitsi.js';

let paymentProvider: PaymentProvider | null = null;
let emailProvider: EmailProvider | null = null;
let storageProvider: StorageProvider | null = null;
let videoProvider: VideoProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!paymentProvider) {
    paymentProvider = new MockPaymentProvider();
  }
  return paymentProvider;
}

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    emailProvider = env.SMTP_HOST ? new SmtpEmailProvider() : new ConsoleEmailProvider();
  }
  return emailProvider;
}

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = new LocalStorageProvider();
  }
  return storageProvider;
}

export function getVideoProvider(): VideoProvider {
  if (!videoProvider) {
    videoProvider = new JitsiVideoProvider();
  }
  return videoProvider;
}

export * from './payment/types.js';
export * from './email/types.js';
export * from './storage/types.js';
export * from './video/types.js';
