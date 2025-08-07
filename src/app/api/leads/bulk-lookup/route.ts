import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { companies, jobTitles } = await request.json();
    
    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: 'Companies array is required' }, { status: 400 });
    }

    const response = await fetch('https://api.apify.com/v2/acts/apify~linkedin-company-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.APIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: companies.map(company => ({ url: `https://www.linkedin.com/company/${company}` })),
        maxItems: 100,
      }),
    });

    if (!response.ok) {
      throw new Error('Apify API request failed');
    }

    const leads = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      leads: leads.map(lead => ({
        name: lead.name,
        company: lead.company,
        title: lead.title,
        email: lead.email,
        linkedin: lead.url,
      }))
    });
  } catch (error) {
    console.error('Bulk lookup error:', error);
    return NextResponse.json({ error: 'Failed to lookup leads' }, { status: 500 });
  }
}