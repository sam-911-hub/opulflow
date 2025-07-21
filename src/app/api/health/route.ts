import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: 'netlify'
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'POST method working',
    timestamp: new Date().toISOString()
  });
}