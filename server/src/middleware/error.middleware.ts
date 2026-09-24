import type { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';
import { ApiError, type FieldError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { isProd } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: FieldError[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  } else if (isMongoDuplicateKeyError(err)) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    message = `A record with this ${field} already exists`;
  } else if (err instanceof Error) {
    message = isProd ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
    ...(!isProd && err instanceof Error && { stack: err.stack }),
  });
}

function isMongoDuplicateKeyError(
  err: unknown,
): err is { code: number; keyPattern?: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}
