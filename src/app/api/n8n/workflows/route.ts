import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    // Check if n8n is configured
    const n8nUrl = process.env.N8N_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nUrl || !n8nApiKey) {
      return NextResponse.json({ 
        error: 'N8N integration not configured. Please contact support.' 
      }, { status: 503 });
    }
    
    // Fetch workflows from n8n with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`N8N API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return NextResponse.json({ workflows: data.data || [] });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('N8N fetch error:', fetchError);
      return NextResponse.json({ 
        workflows: [],
        error: 'N8N service unavailable'
      });
    }
  } catch (error) {
    console.error('N8N workflows error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch workflows',
      workflows: [] 
    }, { status: 500 });
  }
}