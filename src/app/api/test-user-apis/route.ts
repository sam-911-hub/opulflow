import { NextRequest, NextResponse } from 'next/server';

const APOLLO_API_KEY = 'Vs4mYR0wGQYl_63yB1kd8A';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';
const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

export async function POST(request: NextRequest) {
  try {
    const { service, ...params } = await request.json();

    if (service === 'lead-lookup') {
      // Apollo People Enrichment
      const enrichmentParams: any = {};
      
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
      if (params.company) enrichmentParams.organization_name = params.company;
      if (params.domain) enrichmentParams.domain = params.domain;

      const apolloResponse = await fetch(`${APOLLO_BASE_URL}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          error: 'Lead lookup failed',
          status: apolloResponse.status,
          details: errorData
        }, { status: 500 });
      }

      const apolloData = await apolloResponse.json();
      const person = apolloData.person;
      
      return NextResponse.json({
        success: true,
        leads: person ? [{
          id: person.id || 'enriched-' + Date.now(),
          name: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'N/A',
          email: person.email || person.personal_emails?.[0] || 'N/A',
          title: person.title || 'N/A',
          company: person.organization?.name || 'N/A',
          domain: person.organization?.website_url || person.organization?.primary_domain || 'N/A',
          industry: person.organization?.industry || 'N/A',
          location: [person.city, person.state, person.country].filter(Boolean).join(', ') || 'N/A',
          linkedinUrl: person.linkedin_url || null,
          phone: person.phone_numbers?.[0]?.sanitized_number || null,
          source: 'Lead Intelligence',
          enrichedAt: new Date().toISOString()
        }] : [],
        creditsUsed: 0, // Test mode
        provider: 'Lead Intelligence'
      });

    } else if (service === 'email-finder') {
      // Hunter Email Finder
      const hunterParams = new URLSearchParams({
        api_key: HUNTER_API_KEY,
        domain: params.domain || 'example.com'
      });

      if (params.firstName) hunterParams.append('first_name', params.firstName);
      if (params.lastName) hunterParams.append('last_name', params.lastName);

      const hunterResponse = await fetch(`${HUNTER_BASE_URL}/email-finder?${hunterParams}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!hunterResponse.ok) {
        const errorData = await hunterResponse.text();
        return NextResponse.json({ 
          error: 'Email finder failed',
          status: hunterResponse.status,
          details: errorData
        }, { status: 500 });
      }

      const hunterData = await hunterResponse.json();
      
      return NextResponse.json({
        success: true,
        result: hunterData.data ? {
          email: hunterData.data.email,
          firstName: hunterData.data.first_name,
          lastName: hunterData.data.last_name,
          confidence: hunterData.data.confidence,
          provider: 'Email Intelligence',
          foundAt: new Date().toISOString()
        } : null,
        creditsUsed: 0, // Test mode
        provider: 'Email Intelligence'
      });

    } else if (service === 'email-verify') {
      // Hunter Email Verification
      const emails = params.emails || (params.email ? [params.email] : []);
      
      if (emails.length === 0) {
        return NextResponse.json({ 
          error: 'At least one email address is required' 
        }, { status: 400 });
      }

      const results = [];
      for (const email of emails.slice(0, 5)) { // Limit to 5 for testing
        const verifyParams = new URLSearchParams({
          api_key: HUNTER_API_KEY,
          email: email
        });

        const verifyResponse = await fetch(`${HUNTER_BASE_URL}/email-verifier?${verifyParams}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          results.push({
            email: email,
            result: verifyData.data?.result || 'unknown',
            score: verifyData.data?.score || 0,
            disposable: verifyData.data?.disposable || false,
            webmail: verifyData.data?.webmail || false,
            provider: 'Email Intelligence',
            verifiedAt: new Date().toISOString()
          });
        } else {
          results.push({
            email: email,
            result: 'error',
            error: 'Verification failed',
            provider: 'Email Intelligence',
            verifiedAt: new Date().toISOString()
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        summary: {
          total: results.length,
          deliverable: results.filter(r => r.result === 'deliverable').length,
          undeliverable: results.filter(r => r.result === 'undeliverable').length,
          risky: results.filter(r => r.result === 'risky').length
        },
        creditsUsed: 0, // Test mode
        provider: 'Email Intelligence'
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid service. Use "lead-lookup", "email-finder", or "email-verify"' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'User API Test Endpoint - Bypasses Authentication for Testing',
    usage: {
      leadLookup: 'POST { "service": "lead-lookup", "email": "satya@microsoft.com" }',
      emailFinder: 'POST { "service": "email-finder", "domain": "microsoft.com", "firstName": "Satya", "lastName": "Nadella" }',
      emailVerify: 'POST { "service": "email-verify", "emails": ["test@example.com"] }'
    },
    note: 'This endpoint bypasses authentication and credits for testing purposes only'
  });
}