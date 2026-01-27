/**
 * Error types for API and validation errors
 */

/**
 * Standardized API error format
 */
export interface ApiError {
  message: string;       // User-friendly error message
  status: number;        // HTTP status code
  detail?: string;       // Technical details (optional)
}

/**
 * Client-side validation error
 */
export interface ValidationError {
  field: string;         // Field name
  message: string;       // Error message
}

/**
 * Create an ApiError from various error sources
 */
export function createApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      detail: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500,
      detail: err.detail,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}
