import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { AnyZodObject, ZodEffects } from 'zod';

type SchemaType = AnyZodObject | ZodEffects<AnyZodObject>;

interface ValidateSchemas {
  body?: SchemaType;
  headers?: SchemaType;
  query?: SchemaType;
  params?: SchemaType;
}

export function validate(schemas: ValidateSchemas): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.headers) {
        await schemas.headers.parseAsync(req.headers);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
