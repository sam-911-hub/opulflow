import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Lead Intelligence service temporarily unavailable',
    message: 'This service requires an upgraded Apollo.io plan. Please use the Email Finder service instead, or contact support to upgrade your plan.',
    status: 'service_unavailable',
    upgradeUrl: '/pricing'
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    service: 'Lead Intelligence Lookup',
    status: 'unavailable',
    message: 'This service requires an upgraded Apollo.io plan',
    alternative: 'Use Email Finder service instead'
  });
}