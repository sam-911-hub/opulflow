import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Return empty transactions for now to avoid auth issues
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    return NextResponse.json({ 
      transactions: [],
      pagination: {
        limit,
        offset,
        total: 0,
        hasMore: false,
      }
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    return NextResponse.json({ 
      transactions: [],
      pagination: { limit: 10, offset: 0, total: 0, hasMore: false }
    });
  }
}