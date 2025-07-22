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
        leads = profileScrapingResult.leads;
      }
    } else {
      // If no LinkedIn URL, try to find profiles using search
      const searchResult = await searchLinkedInProfiles({ email, name, company, domain });
      if (searchResult.success) {
        leads = searchResult.leads;
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

  } catch (error: any) {
    console.error('Apify lead lookup error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function scrapeLinkedInProfile(linkedinUrl: string) {
  try {
    console.log('Scraping LinkedIn profile:', linkedinUrl);

    // Run Apify LinkedIn Profile Scraper (using HarvestAPI's reliable actor)
    const response = await fetch(`${APIFY_BASE_URL}/acts/harvestapi~linkedin-profile-scraper/runs?token=${APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [linkedinUrl]
      })
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const runData = await response.json();
    const runId = runData.data.id;

    // Wait for the run to complete (with timeout)
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
      const statusData = await statusResponse.json();
      
      if (statusData.data.status === 'SUCCEEDED') {
        // Get the dataset items
        const datasetResponse = await fetch(`${APIFY_BASE_URL}/datasets/${statusData.data.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`);
        const results = await datasetResponse.json();
        
        console.log('Apify scraping results:', results);
        
        if (results && results.length > 0) {
          const profile = results[0];
          const lead = {
            id: profile.profileId || 'apify-' + Date.now(),
            name: profile.fullName || profile.name || 'N/A',
            email: profile.email || 'N/A',
            title: profile.headline || profile.jobTitle || 'N/A',
            company: profile.companyName || profile.currentCompany || 'N/A',
            domain: profile.companyWebsite || 'N/A',
            industry: profile.industry || 'N/A',
            location: profile.location || 'N/A',
            linkedinUrl: profile.url || linkedinUrl,
            phone: profile.phoneNumber || null,
            companySize: profile.companySize || null,
            companyRevenue: null,
            companyDescription: profile.companyDescription || null,
            technologies: [],
            source: 'Lead Intelligence',
            enrichedAt: new Date().toISOString(),
            experience: profile.experience || [],
            education: profile.education || [],
            skills: profile.skills || []
          };
          
          return { success: true, leads: [lead] };
        }
      } else if (statusData.data.status === 'FAILED') {
        throw new Error('Apify scraping failed');
      }
      
      attempts++;
    }
    
    throw new Error('Apify scraping timeout');
    
  } catch (error) {
    console.error('LinkedIn profile scraping error:', error);
    return { success: false, error: error.message };
  }
}

async function searchLinkedInProfiles({ email, name, company, domain }: any) {
  try {
    // For now, return a message that direct URL is required
    // In future, we could integrate LinkedIn search actors
    return {
      success: false,
      error: 'LinkedIn URL required for profile enrichment. Please provide a LinkedIn profile URL.'
    };
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return { success: false, error: error.message };
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