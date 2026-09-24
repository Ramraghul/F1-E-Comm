import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/** Validates req.body/query/params against Zod schemas, replacing them with the parsed (typed) result. */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    // Express 5 exposes `req.query` as a getter-only accessor (no setter), so it can't be
    // reassigned like `req.body`/`req.params` — mutate the existing object in place instead.
    if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  };
}
