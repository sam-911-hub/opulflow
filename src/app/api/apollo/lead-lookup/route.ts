import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/admin';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    const { email, name, company, domain } = await request.json();

    if (!email && !name && !company && !domain) {
      return NextResponse.json({ 
        error: 'At least one search parameter is required (email, name, company, or domain)' 
      }, { status: 400 });
    }

    // Check user credits
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const leadLookupCredits = userData?.credits?.lead_lookup || 0;

    if (leadLookupCredits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Lead lookup requires 1 credit ($0.25)' 
      }, { status: 402 });
    }

    // Prepare Apollo API request
    const searchParams: any = {
      api_key: APOLLO_API_KEY,
      per_page: 10
    };

    // Add search parameters
    if (email) searchParams.contact_emails = [email];
    if (name) searchParams.person_titles = [name];
    if (company) searchParams.organization_names = [company];
    if (domain) searchParams.organization_domains = [domain];

    console.log('Apollo API request params:', searchParams);

    // Make request to Apollo API
    const apolloResponse = await fetch(`${APOLLO_BASE_URL}/mixed_people/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(searchParams)
    });

    if (!apolloResponse.ok) {
      const errorData = await apolloResponse.text();
      console.error('Apollo API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch data from Apollo.io',
        details: errorData
      }, { status: 500 });
    }

    const apolloData = await apolloResponse.json();
    console.log('Apollo API response:', apolloData);

    // Process and format the results
    const leads = apolloData.people?.map((person: any) => ({
      id: person.id,
      name: person.name || 'N/A',
      email: person.email || 'N/A',
      title: person.title || 'N/A',
      company: person.organization?.name || 'N/A',
      domain: person.organization?.website_url || 'N/A',
      industry: person.organization?.industry || 'N/A',
      location: person.city || person.state || person.country || 'N/A',
      linkedinUrl: person.linkedin_url || null,
      phone: person.phone_numbers?.[0]?.sanitized_number || null,
      companySize: person.organization?.estimated_num_employees || null,
      companyRevenue: person.organization?.estimated_annual_revenue || null,
      companyDescription: person.organization?.description || null,
      technologies: person.organization?.technologies?.map((tech: any) => tech.name) || [],
      source: 'Apollo.io',
      enrichedAt: new Date().toISOString()
    })) || [];

    // Deduct credit
    await updateDoc(userRef, {
      'credits.lead_lookup': leadLookupCredits - 1
    });

    // Log transaction
    await addDoc(collection(db, `users/${userId}/transactions`), {
      type: 'usage',
      service: 'lead_lookup',
      amount: 1,
      cost: 0.25,
      provider: 'Apollo.io',
      searchParams: { email, name, company, domain },
      resultsCount: leads.length,
      createdAt: new Date().toISOString(),
      remainingBalance: leadLookupCredits - 1
    });

    return NextResponse.json({
      success: true,
      leads,
      creditsUsed: 1,
      remainingCredits: leadLookupCredits - 1,
      provider: 'Apollo.io'
    });

  } catch (error: any) {
    console.error('Apollo lead lookup error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Apollo.io Lead Lookup',
    cost: '$0.25 per search',
    description: 'Search for leads and enrich with contact and company data',
    parameters: ['email', 'name', 'company', 'domain'],
    example: {
      email: 'john@example.com',
      company: 'Example Corp'
    }
  });
}