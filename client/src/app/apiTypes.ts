export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedEnvelope<T> {
  success: true;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
