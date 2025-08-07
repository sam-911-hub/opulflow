import { NextResponse } from 'next/server';

export function handleApiError(error: any, context: string = 'API') {
  console.error(`${context} error:`, error);
  
  // Firebase specific errors
  if (error.code === 'permission-denied') {
    return NextResponse.json(
      { error: 'Permission denied. Please check your access rights.' },
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
      { error: 'Service quota exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  // Network/timeout errors
  if (error.name === 'AbortError') {
    return NextResponse.json(
      { error: 'Request timeout' },
      { status: 408 }
    );
  }
  
  // Default server error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}