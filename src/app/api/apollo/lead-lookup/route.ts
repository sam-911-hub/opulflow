import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

const APOLLO_API_KEY = 'Vs4mYR0wGQYl_63yB1kd8A';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Lead Intelligence service temporarily unavailable',
    message: 'This service requires an upgraded Apollo.io plan. Please use the Email Finder service instead, or contact support to upgrade your plan.',
    alternative: 'Try the Email Finder tab for email discovery and verification services.',
    status: 'service_unavailable'
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