import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

const APOLLO_API_KEY = 'Vs4mYR0wGQYl_63yB1kd8A';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

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
    const { domain, companyName, apolloId } = await request.json();

    if (!domain && !companyName && !apolloId) {
      return NextResponse.json({ 
        error: 'At least one parameter is required (domain, companyName, or apolloId)' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const companyEnrichmentCredits = userData?.credits?.company_enrichment || 0;

    if (companyEnrichmentCredits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Company enrichment requires 1 credit ($0.35)' 
      }, { status: 402 });
    }

    // Prepare Apollo API request for company search
    const searchParams: any = {};

    // Add search parameters
    if (domain) searchParams.organization_domains = [domain];
    if (companyName) searchParams.organization_names = [companyName];
    if (apolloId) searchParams.organization_ids = [apolloId];

    console.log('Apollo company search params:', searchParams);

    // Make request to Apollo API
    const apolloResponse = await fetch(`${APOLLO_BASE_URL}/organizations/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify({
        per_page: 5,
        ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== 'api_key'))
      })
    });

    if (!apolloResponse.ok) {
      const errorData = await apolloResponse.text();
      console.error('Apollo API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch company data from Apollo.io',
        details: errorData
      }, { status: 500 });
    }

    const apolloData = await apolloResponse.json();
    console.log('Apollo company response:', apolloData);

    // Process and format the results
    const companies = apolloData.organizations?.map((org: any) => ({
      id: org.id,
      name: org.name || 'N/A',
      domain: org.website_url || org.primary_domain || 'N/A',
      industry: org.industry || 'N/A',
      subIndustry: org.sub_industries?.[0] || null,
      description: org.description || null,
      founded: org.founded_year || null,
      employees: org.estimated_num_employees || null,
      employeeRange: org.employee_range || null,
      revenue: org.estimated_annual_revenue || null,
      revenueRange: org.revenue_range || null,
      location: {
        city: org.primary_city,
        state: org.primary_state,
        country: org.primary_country,
        address: org.street_address
      },
      socialProfiles: {
        linkedin: org.linkedin_url,
        twitter: org.twitter_url,
        facebook: org.facebook_url
      },
      technologies: org.technologies?.map((tech: any) => ({
        name: tech.name,
        category: tech.category
      })) || [],
      keywords: org.keywords || [],
      phoneNumbers: org.phone || null,
      emailDomains: org.organization_raw_address || null,
      parentCompany: org.parent_account?.name || null,
      subsidiaries: org.child_accounts?.map((child: any) => child.name) || [],
      fundingInfo: {
        totalFunding: org.total_funding,
        latestFunding: org.latest_funding_round_date,
        fundingStage: org.latest_funding_stage
      },
      marketCap: org.market_cap || null,
      stockSymbol: org.stock_symbol || null,
      source: 'Business Intelligence',
      enrichedAt: new Date().toISOString()
    })) || [];

    // If we have companies, get additional insights for the first one
    let additionalData = null;
    if (companies.length > 0 && companies[0].id) {
      try {
        // Get company insights (news, events, etc.)
        const insightsResponse = await fetch(`${APOLLO_BASE_URL}/organizations/${companies[0].id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          additionalData = {
            recentNews: insightsData.organization?.recent_news || [],
            jobPostings: insightsData.organization?.job_postings_count || 0,
            techStack: insightsData.organization?.technologies || [],
            socialMediaActivity: insightsData.organization?.social_media_urls || {}
          };
        }
      } catch (error) {
        console.warn('Failed to fetch additional company insights:', error);
      }
    }

    // Deduct credit
    await updateDoc(userRef, {
      'credits.company_enrichment': companyEnrichmentCredits - 1
    });

    // Log transaction
    await addDoc(collection(db, `users/${userId}/transactions`), {
      type: 'usage',
      service: 'company_enrichment',
      amount: 1,
      cost: 0.35,
      provider: 'Business Intelligence',
      searchParams: { domain, companyName, apolloId },
      resultsCount: companies.length,
      createdAt: new Date().toISOString(),
      remainingBalance: companyEnrichmentCredits - 1
    });

    return NextResponse.json({
      success: true,
      companies,
      additionalData,
      creditsUsed: 1,
      remainingCredits: companyEnrichmentCredits - 1,
      provider: 'Business Intelligence'
    });

  } catch (error: any) {
    console.error('Apollo company enrichment error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Company Intelligence & Enrichment',
    cost: '$0.35 per search',
    description: 'Get detailed company information including financials, technologies, and insights',
    parameters: ['domain', 'companyName', 'apolloId'],
    example: {
      domain: 'example.com',
      companyName: 'Example Corp'
    }
  });
}