import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw error;
    }
    throw new AppError(400, 'Invalid request body');
  }
}

export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const { searchParams } = request.nextUrl;
  const query: any = {};

  searchParams.forEach((value, key) => {
    // Try to parse numbers
    if (!isNaN(Number(value))) {
      query[key] = Number(value);
    } else if (value === 'true' || value === 'false') {
      query[key] = value === 'true';
    } else {
      query[key] = value;
    }
  });

  return schema.parse(query);
}
