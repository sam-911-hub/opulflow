import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Return empty API keys for now to avoid auth issues
    return NextResponse.json({ apiKeys: [] });
  } catch (error) {
    console.error('List API keys error:', error);
    return NextResponse.json({ apiKeys: [] });
  }
}