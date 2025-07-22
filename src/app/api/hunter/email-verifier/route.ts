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
    const { email, emails } = await request.json();

    // Handle both single email and batch emails
    const emailsToVerify = emails || (email ? [email] : []);
    
    if (emailsToVerify.length === 0) {
      return NextResponse.json({ 
        error: 'At least one email address is required' 
      }, { status: 400 });
    }

    if (emailsToVerify.length > 50) {
      return NextResponse.json({ 
        error: 'Maximum 50 emails can be verified at once' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const emailVerificationCredits = userData?.credits?.email_verification || 0;

    if (emailVerificationCredits < emailsToVerify.length) {
      return NextResponse.json({ 
        error: `Insufficient credits. Need ${emailsToVerify.length} credits, have ${emailVerificationCredits}` 
      }, { status: 402 });
    }

    console.log(`Verifying ${emailsToVerify.length} emails with Hunter.io`);

    // Verify each email
    const verificationResults = [];
    
    for (const emailAddress of emailsToVerify) {
      try {
        const params = new URLSearchParams({
          api_key: HUNTER_API_KEY,
          email: emailAddress
        });

        console.log(`Verifying email: ${emailAddress}`);

        const hunterResponse = await fetch(`${HUNTER_BASE_URL}/email-verifier?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!hunterResponse.ok) {
          const errorData = await hunterResponse.text();
          console.error(`Hunter API error for ${emailAddress}:`, errorData);
          
          // Add failed verification to results
          verificationResults.push({
            email: emailAddress,
                      result: 'error',
          error: 'API request failed',
          provider: 'Email Intelligence',
          verifiedAt: new Date().toISOString()
          });
          continue;
        }

        const hunterData = await hunterResponse.json();
        console.log(`Hunter verification response for ${emailAddress}:`, hunterData);

        // Process the verification result
        const verificationData = hunterData.data || {};
        
        const result = {
          email: emailAddress,
          result: verificationData.result || 'unknown', // deliverable, undeliverable, risky, unknown
          score: verificationData.score || 0, // 0-100 confidence score
          regexp: verificationData.regexp || false, // Email format is valid
          gibberish: verificationData.gibberish || false, // Email looks like gibberish
          disposable: verificationData.disposable || false, // Disposable email service
          webmail: verificationData.webmail || false, // Gmail, Yahoo, etc.
          mxRecords: verificationData.mx_records || false, // Domain has MX records
          smtpServer: verificationData.smtp_server || false, // SMTP server exists
          smtpCheck: verificationData.smtp_check || false, // SMTP server accepts email
          acceptAll: verificationData.accept_all || false, // Domain accepts all emails
          block: verificationData.block || false, // Email is blocked
          sources: verificationData.sources?.map((source: any) => ({
            domain: source.domain,
            uri: source.uri,
            extractedOn: source.extracted_on,
            lastSeenOn: source.last_seen_on,
            stillOnPage: source.still_on_page
          })) || [],
          provider: 'Email Intelligence',
          verifiedAt: new Date().toISOString()
        };

        verificationResults.push(result);

        // Small delay to respect rate limits
        if (emailsToVerify.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error verifying ${emailAddress}:`, error);
        verificationResults.push({
          email: emailAddress,
          result: 'error',
          error: 'Verification failed',
          provider: 'Email Intelligence',
          verifiedAt: new Date().toISOString()
        });
      }
    }

    // Deduct credits
    await updateDoc(userRef, {
      'credits.email_verification': emailVerificationCredits - emailsToVerify.length
    });

    // Log transaction
    await addDoc(collection(db, `users/${userId}/transactions`), {
      type: 'usage',
      service: 'email_verification',
      subService: 'email_verifier',
      amount: emailsToVerify.length,
      cost: emailsToVerify.length * 0.05,
      provider: 'Email Intelligence',
      emailsVerified: emailsToVerify,
      successfulVerifications: verificationResults.filter(r => r.result !== 'error').length,
      createdAt: new Date().toISOString(),
      remainingBalance: emailVerificationCredits - emailsToVerify.length
    });

    // Summary statistics
    const summary = {
      total: verificationResults.length,
      deliverable: verificationResults.filter(r => r.result === 'deliverable').length,
      undeliverable: verificationResults.filter(r => r.result === 'undeliverable').length,
      risky: verificationResults.filter(r => r.result === 'risky').length,
      unknown: verificationResults.filter(r => r.result === 'unknown').length,
      errors: verificationResults.filter(r => r.result === 'error').length,
      averageScore: verificationResults
        .filter(r => r.score > 0)
        .reduce((sum, r) => sum + r.score, 0) / verificationResults.filter(r => r.score > 0).length || 0
    };

    return NextResponse.json({
      success: true,
      results: verificationResults,
      summary,
      creditsUsed: emailsToVerify.length,
      remainingCredits: emailVerificationCredits - emailsToVerify.length,
      provider: 'Email Intelligence'
    });

  } catch (error: any) {
    console.error('Hunter email verification error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Email Verification & Validation',
    cost: '$0.05 per email',
    description: 'Verify email addresses for deliverability and validity',
    parameters: ['email', 'emails (array)'],
    maxBatch: 50,
    example: {
      email: 'john@example.com'
    },
    batchExample: {
      emails: ['john@example.com', 'jane@example.com']
    }
  });
}