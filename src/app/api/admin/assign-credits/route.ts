import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, isUserAdmin } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// Static stub for environments where server APIs are not available (static export)
export async function POST(request: Request) {
  return new Response(JSON.stringify({ error: 'API not available in static export' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}

export async function GET(request: Request) {
  return new Response(JSON.stringify({ error: 'API not available in static export' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}