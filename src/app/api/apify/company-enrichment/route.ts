import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

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
    const { domain, companyName, linkedinCompanyUrl } = await request.json();

    if (!domain && !companyName && !linkedinCompanyUrl) {
      return NextResponse.json({ 
        error: 'At least one parameter is required (domain, companyName, or linkedinCompanyUrl)' 
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

    let companies = [];

    // If LinkedIn company URL is provided, use company scraper directly
    if (linkedinCompanyUrl) {
      const scrapingResult = await scrapeLinkedInCompany(linkedinCompanyUrl);
      if (scrapingResult.success) {
        companies = scrapingResult.companies;
      }
    } else {
      // For domain/company name, we'd need to implement search
      // For now, suggest providing LinkedIn URL
      return NextResponse.json({
        success: false,
        error: 'LinkedIn company URL required for best results. Please provide a LinkedIn company URL.',
        suggestion: `Try searching LinkedIn for "${companyName || domain}" and provide the company page URL.`,
        example: 'https://www.linkedin.com/company/microsoft'
      }, { status: 400 });
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
      searchParams: { domain, companyName, linkedinCompanyUrl },
      resultsCount: companies.length,
      createdAt: new Date().toISOString(),
      remainingBalance: companyEnrichmentCredits - 1
    });

    return NextResponse.json({
      success: true,
      companies,
      creditsUsed: 1,
      remainingCredits: companyEnrichmentCredits - 1,
      provider: 'Business Intelligence'
    });

  } catch (error: any) {
    console.error('Apify company enrichment error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function scrapeLinkedInCompany(linkedinCompanyUrl: string) {
  try {
    console.log('Scraping LinkedIn company:', linkedinCompanyUrl);

    // Run Apify LinkedIn Company Scraper
    const response = await fetch(`${APIFY_BASE_URL}/acts/dev_fusion~Linkedin-Company-Scraper/runs?token=${APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyUrls: [linkedinCompanyUrl]
      })
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const runData = await response.json();
    const runId = runData.data.id;

    // Wait for the run to complete (with timeout)
    let attempts = 0;
    const maxAttempts = 40; // 40 seconds timeout for company data
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
      const statusData = await statusResponse.json();
      
      if (statusData.data.status === 'SUCCEEDED') {
        // Get the dataset items
        const datasetResponse = await fetch(`${APIFY_BASE_URL}/datasets/${statusData.data.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`);
        const results = await datasetResponse.json();
        
        console.log('Apify company scraping results:', results);
        
        if (results && results.length > 0) {
          const companyData = results[0];
          const company = {
            id: companyData.companyId || 'apify-company-' + Date.now(),
            name: companyData.companyName || companyData.name || 'N/A',
            domain: companyData.website || companyData.websiteUrl || 'N/A',
            industry: companyData.industry || 'N/A',
            subIndustry: companyData.industrySubsector || null,
            description: companyData.description || companyData.about || null,
            founded: companyData.foundedYear || companyData.founded || null,
            employees: companyData.employeeCount || companyData.companySize || null,
            employeeRange: companyData.employeeRange || null,
            revenue: null,
            revenueRange: null,
            location: {
              city: companyData.city || null,
              state: companyData.state || null,
              country: companyData.country || null,
              address: companyData.address || companyData.headquarters || null
            },
            socialProfiles: {
              linkedin: companyData.linkedinUrl || linkedinCompanyUrl,
              twitter: companyData.twitterUrl || null,
              facebook: companyData.facebookUrl || null
            },
            technologies: companyData.technologies || [],
            keywords: companyData.specialties || [],
            phoneNumbers: companyData.phone || null,
            emailDomains: null,
            parentCompany: null,
            subsidiaries: [],
            fundingInfo: {
              totalFunding: null,
              latestFunding: null,
              fundingStage: null
            },
            marketCap: null,
            stockSymbol: null,
            followers: companyData.followersCount || null,
            employees_on_linkedin: companyData.employeesOnLinkedIn || null,
            company_type: companyData.companyType || null,
            source: 'Business Intelligence',
            enrichedAt: new Date().toISOString()
          };
          
          return { success: true, companies: [company] };
        }
      } else if (statusData.data.status === 'FAILED') {
        throw new Error('Apify company scraping failed');
      }
      
      attempts++;
    }
    
    throw new Error('Apify company scraping timeout');
    
  } catch (error) {
    console.error('LinkedIn company scraping error:', error);
    return { success: false, error: error.message };
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Company Intelligence & Enrichment',
    cost: '$0.35 per search',
    description: 'Extract comprehensive LinkedIn company data including employee info, industry, and company details',
    provider: 'Apify LinkedIn Company Scraper',
    parameters: ['domain', 'companyName', 'linkedinCompanyUrl'],
    note: 'LinkedIn company URL provides best results',
    example: {
      linkedinCompanyUrl: 'https://www.linkedin.com/company/microsoft',
      companyName: 'Microsoft Corporation'
    }
  });
}