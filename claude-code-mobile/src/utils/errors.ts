/**
 * Error Handling Utilities
 * Custom error classes and error handling helpers
 */

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Network error (HTTP/connection issues)
 */
export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, details?: any) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

/**
 * API error (backend returned error)
 */
export class APIError extends AppError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, 'API_ERROR', statusCode, details);
    this.name = 'APIError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    if (error.statusCode === 404) return 'Resource not found';
    if (error.statusCode === 401) return 'Unauthorized - please check your API key';
    if (error.statusCode === 429) return 'Too many requests - please try again later';
    if (error.statusCode === 503) return 'Service temporarily unavailable';
    return 'Network error - please check your connection';
  }

  if (error instanceof TimeoutError) {
    return 'Request timed out - please try again';
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    // Retry on 5xx errors and specific 4xx errors
    const retryable = [408, 429, 500, 502, 503, 504];
    return error.statusCode ? retryable.includes(error.statusCode) : true;
  }

  if (error instanceof TimeoutError) {
    return true; // Timeouts are retryable
  }

  return false;
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string;
    sessionId?: string;
    userId?: string;
    [key: string]: any;
  }
): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    code: error instanceof AppError ? error.code : undefined,
    statusCode: error instanceof AppError ? error.statusCode : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('[Error]', JSON.stringify(errorInfo, null, 2));

  // In production, send to error tracking service (Sentry, etc.)
}

/**
 * Safe JSON parse (returns null on error)
 */
export function safeJSONParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
