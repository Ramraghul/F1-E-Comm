import type { Response } from 'express';

export function sendSuccess<T>(res: Response, statusCode: number, data: T, message?: string) {
  return res.status(statusCode).json({ success: true, data, ...(message && { message }) });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  return res.status(200).json({
    success: true,
    data,
    pagination: { ...pagination, totalPages },
  });
}
