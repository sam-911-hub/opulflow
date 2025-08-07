import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.builtwith.com/v21/api.json?KEY=${process.env.BUILTWITH_API_KEY}&LOOKUP=${encodeURIComponent(domain)}`);
    
    if (!response.ok) {
      throw new Error('BuiltWith API request failed');
    }

    const data = await response.json();
    
    const technologies = data.Results?.[0]?.Result?.Paths?.[0]?.Technologies || [];
    
    return NextResponse.json({ 
      domain,
      technologies: technologies.map(tech => ({
        name: tech.Name,
        category: tech.Categories?.[0]?.Name,
        description: tech.Description,
        link: tech.Link
      }))
    });
  } catch (error) {
    console.error('Tech stack detection error:', error);
    return NextResponse.json({ error: 'Failed to detect tech stack' }, { status: 500 });
  }
}