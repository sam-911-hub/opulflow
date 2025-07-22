import { NextRequest, NextResponse } from 'next/server';

const APOLLO_API_KEY = 'Vs4mYR0wGQYl_63yB1kd8A';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';
const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

export async function POST(request: NextRequest) {
  try {
    const { service, ...params } = await request.json();

    if (service === 'apollo-test') {
      // Test Apollo API
      const searchParams: any = {
        api_key: APOLLO_API_KEY,
        per_page: 1
      };

      if (params.domain) searchParams.organization_domains = [params.domain];
      if (params.company) searchParams.organization_names = [params.company];

      console.log('Testing Apollo API with params:', searchParams);

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
        return NextResponse.json({ 
          error: 'Apollo API failed',
          status: apolloResponse.status,
          details: errorData
        }, { status: 500 });
      }

      const apolloData = await apolloResponse.json();
      
      return NextResponse.json({
        success: true,
        service: 'Apollo API',
        status: apolloResponse.status,
        resultCount: apolloData.people?.length || 0,
        sampleResult: apolloData.people?.[0] ? {
          name: apolloData.people[0].name,
          email: apolloData.people[0].email,
          company: apolloData.people[0].organization?.name
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