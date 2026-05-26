export interface NormalizedError {
  code: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  originalError?: unknown;
}

export function normalizeError(error: unknown, correlationId?: string): NormalizedError {
  const timestamp = new Date().toISOString();

  if (error instanceof Error) {
    return {
      code: extractErrorCode(error),
      message: error.message,
      timestamp,
      correlationId,
      originalError: error
    };
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    return {
      code: obj['code'] || obj['errorCode'] || 'UNKNOWN_ERROR',
      message: obj['message'] || obj['error'] || 'An unknown error occurred',
      timestamp,
      correlationId,
      originalError: error
    };
  }

  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error,
      timestamp,
      correlationId,
      originalError: error
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
    correlationId,
    originalError: error
  };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('fetch') ||
           message.includes('connection');
  }
  return false;
}

export function isHttpError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    return typeof obj['status'] === 'number' && obj['status'] >= 400;
  }
  return false;
}

function extractErrorCode(error: Error): string {
  const anyError = error as any;
  if (anyError.code) {
    return anyError.code;
  }
  if (anyError.status) {
    return `HTTP_${anyError.status}`;
  }
  return 'UNKNOWN_ERROR';
}
