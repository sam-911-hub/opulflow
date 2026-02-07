import { NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleError(error: any, context?: any): NextResponse {
  // Log error internally with full details
  logger.error('API Error', context, error);

  // Validation errors (Zod)
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors.map(e => e.message) },
      { status: 400 }
    );
  }

  // Custom application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Firebase Auth errors
  if (error?.code?.startsWith('auth/')) {
    const message = getAuthErrorMessage(error.code);
    return NextResponse.json({ error: message }, { status: 401 });
  }

  // Firebase Firestore errors
  if (error?.code?.includes('permission-denied')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (error?.code?.includes('not-found')) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  if (error?.code?.includes('already-exists')) {
    return NextResponse.json({ error: 'Resource already exists' }, { status: 409 });
  }

  // Network/timeout errors
  if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNREFUSED') {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  // Rate limit errors
  if (error?.statusCode === 429) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Default: Never expose internal error details
  return NextResponse.json(
    { error: 'Something went wrong' },
    { status: 500 }
  );
}

function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid credentials',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Invalid credentials',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password too weak',
    'auth/invalid-email': 'Invalid email',
    'auth/user-disabled': 'Account disabled',
    'auth/too-many-requests': 'Too many attempts',
    'auth/id-token-expired': 'Session expired',
    'auth/invalid-id-token': 'Invalid session',
  };

  return messages[code] || 'Authentication failed';
}

export function successResponse(data: any, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}
