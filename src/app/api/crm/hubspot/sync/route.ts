import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { contacts } = await request.json();
    
    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Contacts array is required' }, { status: 400 });
    }

    const hubspotContacts = contacts.map(contact => ({
      properties: {
        email: contact.email,
        firstname: contact.firstName || contact.name?.split(' ')[0],
        lastname: contact.lastName || contact.name?.split(' ').slice(1).join(' '),
        company: contact.company,
        jobtitle: contact.title,
        phone: contact.phone,
      }
    }));

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: hubspotContacts
      }),
    });

    if (!response.ok) {
      throw new Error('HubSpot API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      synced: data.results?.length || 0,
      results: data.results
    });
  } catch (error) {
    console.error('HubSpot sync error:', error);
    return NextResponse.json({ error: 'Failed to sync with HubSpot' }, { status: 500 });
  }
}