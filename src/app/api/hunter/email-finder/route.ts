import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

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
    const { domain, firstName, lastName, fullName } = await request.json();

    if (!domain || (!firstName && !lastName && !fullName)) {
      return NextResponse.json({ 
        error: 'Domain and at least one name parameter are required' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const emailVerificationCredits = userData?.credits?.email_verification || 0;

    if (emailVerificationCredits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits. Email finder requires 1 credit ($0.05)' 
      }, { status: 402 });
    }

    // Prepare Hunter API request
    const params = new URLSearchParams({
      api_key: HUNTER_API_KEY,
      domain: domain
    });

    // Add name parameters
    if (firstName) params.append('first_name', firstName);
    if (lastName) params.append('last_name', lastName);
    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        params.append('first_name', nameParts[0]);
        params.append('last_name', nameParts.slice(1).join(' '));
      }
    }

    console.log('Hunter email finder params:', params.toString());

    // Make request to Hunter API
    const hunterResponse = await fetch(`${HUNTER_BASE_URL}/email-finder?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!hunterResponse.ok) {
      const errorData = await hunterResponse.text();
      console.error('Hunter API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to find email with Hunter.io',
        details: errorData
      }, { status: 500 });
    }

    const hunterData = await hunterResponse.json();
    console.log('Hunter email finder response:', hunterData);

    // Process the result
    const emailData = hunterData.data || {};
    
    const result = {
      email: emailData.email || null,
      firstName: emailData.first_name || firstName || null,
      lastName: emailData.last_name || lastName || null,
      position: emailData.position || null,
      department: emailData.department || null,
      company: emailData.company || null,
      confidence: emailData.confidence || 0,
      acceptAll: emailData.accept_all || false,
      sources: emailData.sources?.map((source: any) => ({
        domain: source.domain,
        uri: source.uri,
        extractedOn: source.extracted_on,
        lastSeenOn: source.last_seen_on,
        stillOnPage: source.still_on_page
      })) || [],
      verificationStatus: null, // Will be filled by verification
      provider: 'Email Intelligence',
      foundAt: new Date().toISOString()
    };

    // If email was found, automatically verify it
    if (result.email) {
      try {
        const verifyParams = new URLSearchParams({
          api_key: HUNTER_API_KEY,
          email: result.email
        });

        const verifyResponse = await fetch(`${HUNTER_BASE_URL}/email-verifier?${verifyParams}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          result.verificationStatus = {
            result: verifyData.data?.result || 'unknown',
            score: verifyData.data?.score || 0,
            regexp: verifyData.data?.regexp || false,
            gibberish: verifyData.data?.gibberish || false,
            disposable: verifyData.data?.disposable || false,
            webmail: verifyData.data?.webmail || false,
            mxRecords: verifyData.data?.mx_records || false,
            smtpServer: verifyData.data?.smtp_server || false,
            smtpCheck: verifyData.data?.smtp_check || false,
            acceptAll: verifyData.data?.accept_all || false,
            block: verifyData.data?.block || false
          };
        }
      } catch (verifyError) {
        console.warn('Email verification failed:', verifyError);
      }
    }

    // Deduct credit
    await updateDoc(userRef, {
      'credits.email_verification': emailVerificationCredits - 1
    });

    // Log transaction
    await addDoc(collection(db, `users/${userId}/transactions`), {
      type: 'usage',
      service: 'email_verification',
      subService: 'email_finder',
      amount: 1,
      cost: 0.05,
      provider: 'Email Intelligence',
      searchParams: { domain, firstName, lastName, fullName },
      emailFound: !!result.email,
      confidence: result.confidence,
      createdAt: new Date().toISOString(),
      remainingBalance: emailVerificationCredits - 1
    });

    return NextResponse.json({
      success: true,
      result,
      creditsUsed: 1,
      remainingCredits: emailVerificationCredits - 1,
      provider: 'Email Intelligence'
    });

  } catch (error: any) {
    console.error('Hunter email finder error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Professional Email Finder',
    cost: '$0.05 per search',
    description: 'Find email addresses for contacts at specific companies',
    parameters: ['domain', 'firstName', 'lastName', 'fullName'],
    example: {
      domain: 'example.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  });
}