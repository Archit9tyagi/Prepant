export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST', details?: unknown): ApiError {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND'): ApiError {
    return new ApiError(404, code, message);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT', details?: unknown): ApiError {
    return new ApiError(409, code, message, details);
  }

  static unprocessable(
    message = 'Validation error',
    code = 'VALIDATION_ERROR',
    details?: unknown,
  ): ApiError {
    return new ApiError(422, code, message, details);
  }

  static tooMany(message = 'Too many requests', code = 'TOO_MANY_REQUESTS'): ApiError {
    return new ApiError(429, code, message);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(500, code, message);
  }
}
