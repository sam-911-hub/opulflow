import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { validateEmail, sanitizeString } from '@/lib/validation';

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
      email,
      firstName,
      lastName,
      company,
      phone,
      website,
      jobTitle,
      leadStatus = 'new',
      lifecycleStage = 'lead',
      properties = {}
    } = await request.json();

    // Validate inputs
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid email address',
        details: emailValidation.errors 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const crmCredits = userData?.credits?.crm_integration || 0;

    const creditsNeeded = 1; // 1 credit per contact creation

    if (crmCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. CRM contact creation requires ${creditsNeeded} credit ($0.15)` 
      }, { status: 402 });
    }

    console.log('Creating HubSpot contact:', {
      email: emailValidation.sanitized,
      firstName,
      lastName,
      company
    });

    // Prepare HubSpot contact properties
    const contactProperties: any = {
      email: emailValidation.sanitized,
      hs_lead_status: leadStatus,
      lifecyclestage: lifecycleStage,
      ...properties
    };

    if (firstName) contactProperties.firstname = sanitizeString(firstName, 100);
    if (lastName) contactProperties.lastname = sanitizeString(lastName, 100);
    if (company) contactProperties.company = sanitizeString(company, 200);
    if (phone) contactProperties.phone = sanitizeString(phone, 50);
    if (website) contactProperties.website = sanitizeString(website, 200);
    if (jobTitle) contactProperties.jobtitle = sanitizeString(jobTitle, 100);

    // Make request to HubSpot API
    const hubspotResponse = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        properties: contactProperties
      })
    });

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.text();
      console.error('HubSpot API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'crm_integration', 0.15, false, {
        error: errorData,
        email: emailValidation.sanitized
      });

      return NextResponse.json({ 
        error: 'Failed to create contact in HubSpot',
        details: errorData,
        service: 'CRM Integration'
      }, { status: 500 });
    }

    const hubspotData = await hubspotResponse.json();
    console.log('HubSpot contact created successfully');

    const result = {
      contactId: hubspotData.id,
      email: emailValidation.sanitized,
      firstName: firstName || null,
      lastName: lastName || null,
      company: company || null,
      phone: phone || null,
      website: website || null,
      jobTitle: jobTitle || null,
      leadStatus,
      lifecycleStage,
      hubspotUrl: `https://app.hubspot.com/contacts/${hubspotData.id}`,
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
      subService: 'contact_creation',
      amount: creditsNeeded,
      cost: 0.15,
      provider: 'HubSpot',
      contactId: result.contactId,
      email: emailValidation.sanitized,
      company: company || null,
      createdAt: new Date().toISOString(),
      remainingBalance: crmCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'crm_integration', 0.15, true, {
      contactId: result.contactId,
      email: emailValidation.sanitized
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
    console.error('HubSpot contact creation error:', error);
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
    const email = searchParams.get('email');
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

    let hubspotUrl = `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts?limit=${limit}&after=${offset}`;
    
    if (email) {
      // Search by email
      hubspotUrl = `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/search`;
    }

    const requestOptions: any = {
      method: email ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      }
    };

    if (email) {
      requestOptions.body = JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }],
        properties: [
          'email', 'firstname', 'lastname', 'company', 
          'phone', 'website', 'jobtitle', 'hs_lead_status', 
          'lifecyclestage', 'createdate', 'lastmodifieddate'
        ]
      });
    }

    const hubspotResponse = await fetch(hubspotUrl, requestOptions);

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.text();
      console.error('HubSpot API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to search contacts in HubSpot',
        details: errorData
      }, { status: 500 });
    }

    const hubspotData = await hubspotResponse.json();
    
    const contacts = hubspotData.results?.map((contact: any) => ({
      contactId: contact.id,
      email: contact.properties?.email || null,
      firstName: contact.properties?.firstname || null,
      lastName: contact.properties?.lastname || null,
      company: contact.properties?.company || null,
      phone: contact.properties?.phone || null,
      website: contact.properties?.website || null,
      jobTitle: contact.properties?.jobtitle || null,
      leadStatus: contact.properties?.hs_lead_status || null,
      lifecycleStage: contact.properties?.lifecyclestage || null,
      createdAt: contact.properties?.createdate || null,
      updatedAt: contact.properties?.lastmodifieddate || null,
      hubspotUrl: `https://app.hubspot.com/contacts/${contact.id}`,
      provider: 'HubSpot'
    })) || [];

    // Deduct credits
    await userRef.update({
      'credits.crm_integration': crmCredits - creditsNeeded
    });

    return NextResponse.json({
      success: true,
      contacts,
      total: hubspotData.total || contacts.length,
      hasMore: !!hubspotData.paging?.next,
      creditsUsed: creditsNeeded,
      remainingCredits: crmCredits - creditsNeeded,
      provider: 'HubSpot'
    });

  } catch (error: any) {
    console.error('HubSpot contact search error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}