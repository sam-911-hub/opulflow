import { NextResponse } from 'next/server';
import { logger } from './security/logger';
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

export function handleApiError(error: any, context: string = 'API') {
  logger.error(`${context} error`, { context }, error);
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  if (error.code === 'permission-denied') {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  if (error.code === 'unauthenticated') {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (error.code === 'not-found') {
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }
  
  if (error.code === 'quota-exceeded') {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  if (error.name === 'AbortError') {
    return NextResponse.json(
      { error: 'Request timeout' },
      { status: 408 }
    );
  }
  
  return NextResponse.json(
    { error: 'Something went wrong' },
    { status: 500 }
  );
}