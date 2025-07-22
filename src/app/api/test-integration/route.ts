import { NextRequest, NextResponse } from 'next/server';

const APOLLO_API_KEY = 'Vs4mYR0wGQYl_63yB1kd8A';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';
const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

export async function POST(request: NextRequest) {
  try {
    const { service, ...params } = await request.json();

    if (service === 'apollo-test') {
      // Test Apollo People Enrichment API (works with free plan)
      const enrichmentParams: any = {};

      if (params.domain) enrichmentParams.domain = params.domain;
      if (params.company) enrichmentParams.organization_name = params.company;
      if (params.email) enrichmentParams.email = params.email;
      if (params.name) {
        const nameParts = params.name.split(' ');
        if (nameParts.length >= 2) {
          enrichmentParams.first_name = nameParts[0];
          enrichmentParams.last_name = nameParts.slice(1).join(' ');
        } else {
          enrichmentParams.first_name = params.name;
        }
      }

      console.log('Testing Apollo Enrichment API with params:', enrichmentParams);

      const apolloResponse = await fetch(`${APOLLO_BASE_URL}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        },
        body: JSON.stringify({
          reveal_personal_emails: true,
          reveal_phone_number: true,
          ...enrichmentParams
        })
      });

      if (!apolloResponse.ok) {
        const errorData = await apolloResponse.text();
        return NextResponse.json({ 
          error: 'Apollo API failed',
          status: apolloResponse.status,
          details: errorData
        }, { status: 500 });
      }

      const apolloData = await apolloResponse.json();
      
      return NextResponse.json({
        success: true,
        service: 'Apollo Enrichment API',
        status: apolloResponse.status,
        found: !!apolloData.person,
        result: apolloData.person ? {
          name: apolloData.person.name || `${apolloData.person.first_name || ''} ${apolloData.person.last_name || ''}`.trim(),
          email: apolloData.person.email || apolloData.person.personal_emails?.[0],
          company: apolloData.person.organization?.name,
          title: apolloData.person.title
        } : null
      });

    } else if (service === 'hunter-test') {
      // Test Hunter API
      const hunterParams = new URLSearchParams({
        api_key: HUNTER_API_KEY,
        domain: params.domain || 'example.com'
      });

      if (params.firstName) hunterParams.append('first_name', params.firstName);
      if (params.lastName) hunterParams.append('last_name', params.lastName);

      console.log('Testing Hunter API with params:', hunterParams.toString());

      const hunterResponse = await fetch(`${HUNTER_BASE_URL}/email-finder?${hunterParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!hunterResponse.ok) {
        const errorData = await hunterResponse.text();
        return NextResponse.json({ 
          error: 'Hunter API failed',
          status: hunterResponse.status,
          details: errorData
        }, { status: 500 });
      }

      const hunterData = await hunterResponse.json();
      
      return NextResponse.json({
        success: true,
        service: 'Hunter API',
        status: hunterResponse.status,
        result: hunterData.data ? {
          email: hunterData.data.email,
          confidence: hunterData.data.confidence,
          firstName: hunterData.data.first_name,
          lastName: hunterData.data.last_name
        } : null
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid service. Use "apollo-test" or "hunter-test"' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Integration Test Endpoint',
    usage: {
      apollo: 'POST { "service": "apollo-test", "domain": "microsoft.com" }',
      hunter: 'POST { "service": "hunter-test", "domain": "microsoft.com", "firstName": "Satya", "lastName": "Nadella" }'
    },
    note: 'This endpoint bypasses authentication for testing purposes only'
  });
}