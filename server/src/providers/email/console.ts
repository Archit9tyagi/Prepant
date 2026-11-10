import type { EmailProvider, SendEmailInput } from './types.js';
import { logger } from '../../config/logger.js';

export class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    logger.info(
      {
        to: input.to,
        subject: input.subject,
        textPreview: input.text?.slice(0, 100) || input.html.slice(0, 100),
      },
      '[DEV/TEST EMAIL SENT]',
    );
  }
}
