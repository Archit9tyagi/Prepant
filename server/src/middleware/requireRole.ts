import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';

export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('User must be authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Requires one of roles: [${roles.join(', ')}]`);
    }

    next();
  };
}
