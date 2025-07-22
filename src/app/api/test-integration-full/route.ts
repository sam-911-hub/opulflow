import { NextRequest, NextResponse } from 'next/server';

const APIFY_API_TOKEN = 'apify_api_WSXLJzUgmq1BKGDQX0fWeqAx0Hp9R114klEk';
const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

export async function GET() {
  return NextResponse.json({
    message: 'Comprehensive API Integration Test',
    services: {
      apify: 'LinkedIn Profile & Company Enrichment',
      hunter: 'Email Finding & Verification'
    },
    tests: [
      'POST /test-apify - Test Apify LinkedIn scraping',
      'POST /test-hunter - Test Hunter email services',
      'POST /test-both - Test both APIs together'
    ],
    examples: {
      apify: {
        service: 'profile-test',
        linkedinUrl: 'https://www.linkedin.com/in/satyanadella'
      },
      hunter: {
        service: 'email-finder',
        domain: 'microsoft.com',
        firstName: 'Satya',
        lastName: 'Nadella'
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { test } = await request.json();
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test Apify LinkedIn Profile Scraper
    if (test === 'apify' || test === 'both') {
      console.log('Testing Apify LinkedIn Profile Scraper...');
      try {
        const apifyResult = await testApifyIntegration();
        results.tests.apify = {
          status: 'success',
          service: 'LinkedIn Profile Enrichment',
          ...apifyResult
        };
      } catch (error: any) {
        results.tests.apify = {
          status: 'error',
          service: 'LinkedIn Profile Enrichment',
          error: error.message,
          details: error.details || 'Unknown error'
        };
      }
    }

    // Test Hunter Email Services
    if (test === 'hunter' || test === 'both') {
      console.log('Testing Hunter Email Services...');
      try {
        const hunterResult = await testHunterIntegration();
        results.tests.hunter = {
          status: 'success',
          service: 'Email Finding & Verification',
          ...hunterResult
        };
      } catch (error: any) {
        results.tests.hunter = {
          status: 'error',
          service: 'Email Finding & Verification',
          error: error.message,
          details: error.details || 'Unknown error'
        };
      }
    }

    // Calculate overall status
    const allTests = Object.values(results.tests) as any[];
    const successCount = allTests.filter(t => t.status === 'success').length;
    const totalTests = allTests.length;
    
    results.overall = {
      status: successCount === totalTests ? 'success' : 'partial',
      successRate: `${successCount}/${totalTests}`,
      message: successCount === totalTests ? 
        'All APIs are working correctly!' : 
        `${successCount} out of ${totalTests} APIs working`
    };

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Test integration error:', error);
    return NextResponse.json({
      error: 'Test execution failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testApifyIntegration() {
  const linkedinUrl = 'https://www.linkedin.com/in/satyanadella';
  
  // Start the Apify actor run
  const response = await fetch(`${APIFY_BASE_URL}/acts/harvestapi~linkedin-profile-scraper/runs?token=${APIFY_API_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startUrls: [linkedinUrl],
      maxItems: 1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Apify API failed: ${response.status} - ${errorText}`);
  }

  const runData = await response.json();
  console.log('Apify run started:', runData);

  return {
    actorId: 'harvestapi~linkedin-profile-scraper',
    runId: runData.data?.id,
    status: runData.data?.status,
    startedAt: runData.data?.startedAt,
    inputUrl: linkedinUrl,
    message: 'Apify actor run initiated successfully',
    note: 'Full results available after run completion (1-2 minutes)'
  };
}

async function testHunterIntegration() {
  // Test Hunter Email Finder
  const domain = 'microsoft.com';
  const firstName = 'Satya';
  const lastName = 'Nadella';

  const hunterResponse = await fetch(`https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`);

  if (!hunterResponse.ok) {
    const errorText = await hunterResponse.text();
    throw new Error(`Hunter API failed: ${hunterResponse.status} - ${errorText}`);
  }

  const hunterData = await hunterResponse.json();
  console.log('Hunter response:', hunterData);

  // Test Hunter Email Verifier if email found
  let verificationResult = null;
  if (hunterData.data?.email) {
    try {
      const verifyResponse = await fetch(`https://api.hunter.io/v2/email-verifier?email=${hunterData.data.email}&api_key=${HUNTER_API_KEY}`);
      if (verifyResponse.ok) {
        verificationResult = await verifyResponse.json();
      }
    } catch (error) {
      console.log('Verification test skipped:', error);
    }
  }

  return {
    emailFinder: {
      email: hunterData.data?.email || 'Not found',
      confidence: hunterData.data?.confidence,
      sources: hunterData.data?.sources?.length || 0,
      firstName: hunterData.data?.first_name,
      lastName: hunterData.data?.last_name,
      position: hunterData.data?.position
    },
    emailVerifier: verificationResult ? {
      result: verificationResult.data?.result,
      score: verificationResult.data?.score,
      regexp: verificationResult.data?.regexp,
      gibberish: verificationResult.data?.gibberish,
      disposable: verificationResult.data?.disposable
    } : 'Not tested',
    apiCallsUsed: {
      finder: 1,
      verifier: verificationResult ? 1 : 0
    },
    message: 'Hunter email services working correctly'
  };
}