import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Company Intelligence service temporarily unavailable',
    message: 'This service requires an upgraded Apollo.io plan. Please use the Email Finder service instead, or contact support to upgrade your plan.',
    alternative: 'Try the Email Finder tab for email discovery and verification services.',
    status: 'service_unavailable'
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    service: 'Company Intelligence & Enrichment',
    status: 'unavailable',
    message: 'This service requires an upgraded Apollo.io plan',
    alternative: 'Use Email Finder service instead'
  });
}