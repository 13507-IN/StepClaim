/**
 * Standardized API response type.
 * All API endpoints should return responses matching this shape.
 *
 * @typeParam T - The type of the data payload
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response extending the base ApiResponse.
 * Used for list endpoints that support pagination.
 *
 * @typeParam T - The type of items in the data array
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a success response payload.
 *
 * @param data - The response data payload
 * @param message - Optional success message
 * @returns Formatted success response object
 *
 * @example
 * ```ts
 * return reply.send(successResponse({ user: { id: '123', username: 'runner' } }));
 * ```
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create an error response payload.
 *
 * @param error - Error identifier or code
 * @param message - Optional human-readable error description
 * @returns Formatted error response object
 *
 * @example
 * ```ts
 * return reply.status(400).send(errorResponse('INVALID_INPUT', 'Email is required'));
 * ```
 */
export function errorResponse(
  error: string,
  message?: string
): ApiResponse<never> {
  return {
    success: false,
    error,
    ...(message && { message }),
  };
}

/**
 * Create a paginated response payload.
 *
 * @param data - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Formatted paginated response with metadata
 *
 * @example
 * ```ts
 * const users = await prisma.user.findMany({ skip, take });
 * const total = await prisma.user.count();
 * return reply.send(paginatedResponse(users, total, 1, 20));
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
