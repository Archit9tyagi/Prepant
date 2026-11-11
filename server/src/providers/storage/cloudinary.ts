import { v2 as cloudinary } from 'cloudinary';
import type { StorageProvider, UploadResult } from './types.js';
import { env } from '../../config/env.js';

export class CloudinaryStorageProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `prepant/${folder}`, resource_type: resourceType },
        (error, result) => {
          if (error || !result?.secure_url || !result.public_id) {
            reject(error || new Error('Cloudinary upload returned no result'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }

  async getSignedUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId, { secure: true, sign_url: true });
  }
}
