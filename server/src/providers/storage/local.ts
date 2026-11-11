import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import type { StorageProvider, UploadResult } from './types.js';
import { env } from '../../config/env.js';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir = 'uploads') {
    this.baseDir = path.resolve(process.cwd(), baseDir);
  }

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const targetDir = path.join(this.baseDir, folder);
    await fs.mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.originalname) || '.bin';
    const filename = `${Date.now()}_${randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(targetDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const publicId = `${folder}/${filename}`;
    const url = `${env.SERVER_URL}/uploads/${publicId}`;

    return { url, publicId };
  }

  async delete(publicId: string): Promise<void> {
    const filePath = path.join(this.baseDir, publicId);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getSignedUrl(publicId: string): Promise<string> {
    return `${env.CLIENT_URL}/uploads/${publicId}?signed=1`;
  }
}
