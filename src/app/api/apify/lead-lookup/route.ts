import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';

const APIFY_API_TOKEN = 'apify_api_WSXLJzUgmq1BKGDQX0fWeqAx0Hp9R114klEk';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get request body
    const { email, name, company, domain, linkedinUrl } = await request.json();

    if (!email && !name && !company && !domain && !linkedinUrl) {
      return NextResponse.json({ 
        error: 'At least one search parameter is required (email, name, company, domain, or linkedinUrl)' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const leadLookupCredits = userData?.credits?.lead_lookup || 0;

    if (leadLookupCredits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Lead lookup requires 1 credit ($0.25)' 
      }, { status: 402 });
    }

    let leads = [];

    // If LinkedIn URL is provided, use profile scraper directly
    if (linkedinUrl) {
      const profileScrapingResult = await scrapeLinkedInProfile(linkedinUrl);
      if (profileScrapingResult.success) {
        leads = profileScrapingResult.leads || [];
      }
    } else {
      // If no LinkedIn URL, try to find profiles using search
              const searchResult = await searchLinkedInProfiles();
      if (searchResult.success) {
        leads = searchResult.leads || [];
      }
    }

    // Deduct credit
    await userRef.update({
      'credits.lead_lookup': leadLookupCredits - 1
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'lead_lookup',
      amount: 1,
      cost: 0.25,
      provider: 'Lead Intelligence',
      searchParams: { email, name, company, domain, linkedinUrl },
      resultsCount: leads.length,
      createdAt: new Date().toISOString(),
      remainingBalance: leadLookupCredits - 1
    });

    return NextResponse.json({
      success: true,
      leads,
      creditsUsed: 1,
      remainingCredits: leadLookupCredits - 1,
      provider: 'Lead Intelligence'
    });

  } catch (error: unknown) {
    console.error('Apify lead lookup error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function scrapeLinkedInProfile(linkedinUrl: string) {
  try {
    console.log('Starting LinkedIn profile scraping for:', linkedinUrl);
    
    // Start the Apify actor run with timeout
    const response = await fetch(`${APIFY_BASE_URL}/acts/harvestapi~linkedin-profile-scraper/runs?token=${APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [linkedinUrl],
        maxItems: 1,
        timeout: 120 // 2 minute timeout
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', errorText);
      return {
        success: false,
        error: `LinkedIn scraping failed: ${response.status}`,
        details: errorText
      };
    }

    const runData = await response.json();
    const runId = runData.data?.id;
    
    if (!runId) {
      return {
        success: false,
        error: 'Failed to start LinkedIn scraping job'
      };
    }

    console.log('Apify run started:', runId);

    // For now, return a placeholder with run ID - results will be available later
    return {
      success: true,
      leads: [{
        id: `apify-run-${runId}`,
        name: 'LinkedIn Profile Data',
        email: 'Processing...',
        title: 'Data extraction in progress',
        company: 'LinkedIn Profile',
        domain: 'linkedin.com',
        industry: 'Professional Networking',
        location: 'Processing...',
        linkedinUrl: linkedinUrl,
        source: 'Lead Intelligence',
        enrichedAt: new Date().toISOString(),
        processingStatus: 'PENDING',
        runId: runId,
        note: 'Full profile data will be available in 1-2 minutes. Check back later or use webhook for real-time updates.'
      }]
    };

      } catch (error: unknown) {
    console.error('LinkedIn scraping error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: 'LinkedIn scraping service temporarily unavailable',
      details: errorMessage
    };
  }
}

async function searchLinkedInProfiles() {
  try {
    // For now, return a message that direct URL is required
    // In future, we could integrate LinkedIn search actors
    return {
      success: false,
      error: 'LinkedIn URL required for profile enrichment. Please provide a LinkedIn profile URL.'
    };
  } catch (error: unknown) {
    console.error('LinkedIn search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Lead Intelligence Lookup',
    cost: '$0.25 per search',
    description: 'Extract comprehensive LinkedIn profile data including contact information',
    provider: 'Apify LinkedIn Scraper',
    parameters: ['email', 'name', 'company', 'domain', 'linkedinUrl'],
    note: 'LinkedIn profile URL provides best results',
    example: {
      linkedinUrl: 'https://www.linkedin.com/in/example-profile',
      name: 'John Doe',
      company: 'Example Corp'
    }
  });
}