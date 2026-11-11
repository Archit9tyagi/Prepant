import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, allowedTypes.has(file.mimetype));
  },
});

export function assertUploadSize(file: Express.Multer.File, maxBytes: number): void {
  if (file.size > maxBytes) {
    throw ApiError.badRequest(
      `Uploaded file exceeds the ${Math.floor(maxBytes / 1024 / 1024)} MB limit`,
      'FILE_TOO_LARGE',
    );
  }
}
