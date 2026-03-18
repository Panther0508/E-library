/**
 * Error Handling Utilities
 * 
 * Provides comprehensive error handling for the API,
 * including custom error classes, error responses, and logging.
 */

import { ApiError } from './types';

// Custom Error Classes
export class ApiException extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }
}

export class ValidationError extends ApiException {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiException {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiException {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalApiError extends ApiException {
  constructor(message: string = 'External API error') {
    super(message, 502, 'EXTERNAL_API_ERROR');
    this.name = 'ExternalApiError';
  }
}

export class CacheError extends ApiException {
  constructor(message: string = 'Cache error') {
    super(message, 500, 'CACHE_ERROR');
    this.name = 'CacheError';
  }
}

// Error Code Mappings
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Invalid request parameters',
  NOT_FOUND: 'The requested resource was not found',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  EXTERNAL_API_ERROR: 'Unable to fetch data from external service',
  CACHE_ERROR: 'Internal cache error',
  INTERNAL_ERROR: 'An unexpected error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Bad request',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  INVALID_PAGE: 'Invalid page number',
  INVALID_LIMIT: 'Invalid limit value',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  INVALID_CATEGORY: 'Invalid category',
  INVALID_JOB_TYPE: 'Invalid job type',
  SEARCH_TOO_SHORT: 'Search query must be at least 2 characters',
} as const;

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  code: string,
  details?: unknown,
  requestId?: string
): Response {
  const error: ApiError = {
    statusCode,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return new Response(JSON.stringify({ success: false, error }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/**
 * Handle known errors and return appropriate response
 */
export function handleKnownError(error: unknown, requestId?: string): Response {
  if (error instanceof ApiException) {
    return createErrorResponse(
      error.statusCode,
      error.message,
      error.code,
      error.details,
      requestId
    );
  }

  if (error instanceof ValidationError) {
    return createErrorResponse(400, error.message, error.code, error.details, requestId);
  }

  if (error instanceof NotFoundError) {
    return createErrorResponse(404, error.message, error.code, undefined, requestId);
  }

  if (error instanceof RateLimitError) {
    return createErrorResponse(429, error.message, error.code, undefined, requestId);
  }

  if (error instanceof ExternalApiError) {
    return createErrorResponse(502, error.message, error.code, undefined, requestId);
  }

  // Unknown error
  return createErrorResponse(
    500,
    ERROR_MESSAGES.INTERNAL_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    undefined,
    requestId
  );
}

/**
 * Handle unhandled errors with logging
 */
export function handleUnhandledError(error: unknown, context?: string): Response {
  // Log error for debugging
  console.error(`[ERROR] ${context || 'Unhandled Error'}:`, error);

  // In production, don't expose internal error details
  const message = process.env.NODE_ENV === 'production' 
    ? ERROR_MESSAGES.INTERNAL_ERROR 
    : error instanceof Error ? error.message : 'Unknown error';

  return createErrorResponse(
    500,
    message,
    ERROR_CODES.INTERNAL_ERROR,
    process.env.NODE_ENV !== 'production' ? String(error) : undefined
  );
}

/**
 * Validate required fields
 */
export function validateRequired(
  fields: Record<string, unknown>,
  required: string[]
): void {
  const missing: string[] = [];

  for (const field of required) {
    if (fields[field] === undefined || fields[field] === null || fields[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(
      ERROR_MESSAGES.MISSING_REQUIRED_FIELD,
      { missingFields: missing }
    );
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.min(100, Math.max(1, limit || 20));

  return { page: validPage, limit: validLimit };
}

/**
 * Validate search query
 */
export function validateSearchQuery(query?: string): string {
  if (!query || query.trim().length < 2) {
    throw new ValidationError(ERROR_MESSAGES.SEARCH_TOO_SHORT);
  }

  return query.trim().substring(0, 100); // Limit query length
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1',
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Log API request
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  requestId: string
): void {
  const log = {
    timestamp: new Date().toISOString(),
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    requestId,
  };

  if (statusCode >= 500) {
    console.error('[API_ERROR]', JSON.stringify(log));
  } else if (statusCode >= 400) {
    console.warn('[API_WARNING]', JSON.stringify(log));
  } else {
    console.log('[API_REQUEST]', JSON.stringify(log));
  }
}
