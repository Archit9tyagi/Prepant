import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import type { EmailProvider, SendEmailInput } from './types.js';

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({ from: env.EMAIL_FROM, ...input });
  }
}
