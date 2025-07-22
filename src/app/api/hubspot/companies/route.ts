import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const HUBSPOT_ACCESS_TOKEN = 'pat-eu1-87f46f2f-f4a7-44fe-acb5-3bf5ae87e725';
const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'crm-integration');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get request body
    const { 
      name,
      domain,
      industry,
      description,
      phone,
      city,
      state,
      country,
      employees,
      annualRevenue,
      properties = {}
    } = await request.json();

    // Validate inputs
    if (!name && !domain) {
      return NextResponse.json({ 
        error: 'Company name or domain is required' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const crmCredits = userData?.credits?.crm_integration || 0;

    const creditsNeeded = 1; // 1 credit per company creation

    if (crmCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. CRM company creation requires ${creditsNeeded} credit ($0.15)` 
      }, { status: 402 });
    }

    console.log('Creating HubSpot company:', {
      name,
      domain,
      industry
    });

    // Prepare HubSpot company properties
    const companyProperties: any = {
      ...properties
    };

    if (name) companyProperties.name = sanitizeString(name, 200);
    if (domain) companyProperties.domain = sanitizeString(domain, 200);
    if (industry) companyProperties.industry = sanitizeString(industry, 100);
    if (description) companyProperties.description = sanitizeString(description, 1000);
    if (phone) companyProperties.phone = sanitizeString(phone, 50);
    if (city) companyProperties.city = sanitizeString(city, 100);
    if (state) companyProperties.state = sanitizeString(state, 100);
    if (country) companyProperties.country = sanitizeString(country, 100);
    if (employees) companyProperties.numberofemployees = employees.toString();
    if (annualRevenue) companyProperties.annualrevenue = annualRevenue.toString();

    // Make request to HubSpot API
    const hubspotResponse = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        properties: companyProperties
      })
    });

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.text();
      console.error('HubSpot API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'crm_integration', 0.15, false, {
        error: errorData,
        name,
        domain
      });

      return NextResponse.json({ 
        error: 'Failed to create company in HubSpot',
        details: errorData,
        service: 'CRM Integration'
      }, { status: 500 });
    }

    const hubspotData = await hubspotResponse.json();
    console.log('HubSpot company created successfully');

    const result = {
      companyId: hubspotData.id,
      name: name || null,
      domain: domain || null,
      industry: industry || null,
      description: description || null,
      phone: phone || null,
      city: city || null,
      state: state || null,
      country: country || null,
      employees: employees || null,
      annualRevenue: annualRevenue || null,
      hubspotUrl: `https://app.hubspot.com/companies/${hubspotData.id}`,
      createdAt: hubspotData.createdAt || new Date().toISOString(),
      updatedAt: hubspotData.updatedAt || new Date().toISOString(),
      provider: 'HubSpot',
      properties: hubspotData.properties || {}
    };

    // Deduct credits
    await userRef.update({
      'credits.crm_integration': crmCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'crm_integration',
      subService: 'company_creation',
      amount: creditsNeeded,
      cost: 0.15,
      provider: 'HubSpot',
      companyId: result.companyId,
      name: name || null,
      domain: domain || null,
      createdAt: new Date().toISOString(),
      remainingBalance: crmCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'crm_integration', 0.15, true, {
      companyId: result.companyId,
      name,
      domain
    });

    return NextResponse.json({
      success: true,
      result,
      creditsUsed: creditsNeeded,
      remainingCredits: crmCredits - creditsNeeded,
      cost: 0.15,
      provider: 'HubSpot'
    });

  } catch (error: any) {
    console.error('HubSpot company creation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const name = searchParams.get('name');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const crmCredits = userData?.credits?.crm_integration || 0;

    const creditsNeeded = 1; // 1 credit per search

    if (crmCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. CRM search requires ${creditsNeeded} credit ($0.10)` 
      }, { status: 402 });
    }

    let hubspotUrl = `${HUBSPOT_BASE_URL}/crm/v3/objects/companies?limit=${limit}&after=${offset}`;
    
    const requestOptions: any = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      }
    };

    if (domain || name) {
      // Search by domain or name
      hubspotUrl = `${HUBSPOT_BASE_URL}/crm/v3/objects/companies/search`;
      requestOptions.method = 'POST';
      
      const filters = [];
      if (domain) {
        filters.push({
          propertyName: 'domain',
          operator: 'EQ',
          value: domain
        });
      }
      if (name) {
        filters.push({
          propertyName: 'name',
          operator: 'CONTAINS_TOKEN',
          value: name
        });
      }

      requestOptions.body = JSON.stringify({
        filterGroups: [{
          filters: filters
        }],
        properties: [
          'name', 'domain', 'industry', 'description', 
          'phone', 'city', 'state', 'country', 
          'numberofemployees', 'annualrevenue', 
          'createdate', 'hs_lastmodifieddate'
        ]
      });
    }

    const hubspotResponse = await fetch(hubspotUrl, requestOptions);

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.text();
      console.error('HubSpot API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to search companies in HubSpot',
        details: errorData
      }, { status: 500 });
    }

    const hubspotData = await hubspotResponse.json();
    
    const companies = hubspotData.results?.map((company: any) => ({
      companyId: company.id,
      name: company.properties?.name || null,
      domain: company.properties?.domain || null,
      industry: company.properties?.industry || null,
      description: company.properties?.description || null,
      phone: company.properties?.phone || null,
      city: company.properties?.city || null,
      state: company.properties?.state || null,
      country: company.properties?.country || null,
      employees: company.properties?.numberofemployees || null,
      annualRevenue: company.properties?.annualrevenue || null,
      createdAt: company.properties?.createdate || null,
      updatedAt: company.properties?.hs_lastmodifieddate || null,
      hubspotUrl: `https://app.hubspot.com/companies/${company.id}`,
      provider: 'HubSpot'
    })) || [];

    // Deduct credits
    await userRef.update({
      'credits.crm_integration': crmCredits - creditsNeeded
    });

    return NextResponse.json({
      success: true,
      companies,
      total: hubspotData.total || companies.length,
      hasMore: !!hubspotData.paging?.next,
      creditsUsed: creditsNeeded,
      remainingCredits: crmCredits - creditsNeeded,
      provider: 'HubSpot'
    });

  } catch (error: any) {
    console.error('HubSpot company search error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}