import { NextRequest, NextResponse } from 'next/server';

const APIFY_API_TOKEN = 'apify_api_WSXLJzUgmq1BKGDQX0fWeqAx0Hp9R114klEk';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

export async function POST(request: NextRequest) {
  try {
    const { service, linkedinUrl } = await request.json();

    if (service === 'profile-test') {
      const result = await testLinkedInProfileScraper(linkedinUrl);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });

  } catch (error: any) {
    console.error('Apify test error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function testLinkedInProfileScraper(linkedinUrl: string) {
  try {
    console.log('Testing LinkedIn profile scraper with:', linkedinUrl);

    // Run Apify LinkedIn Profile Scraper
    const response = await fetch(`${APIFY_BASE_URL}/acts/dev_fusion~linkedin-profile-scraper/runs?token=${APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileUrls: [linkedinUrl]
      })
    });

    console.log('Apify response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', errorText);
      return { success: false, error: `Apify API error: ${response.status} - ${errorText}` };
    }

    const runData = await response.json();
    console.log('Run data:', runData);
    
    const runId = runData.data.id;
    console.log('Run ID:', runId);

    // Wait for the run to complete (with timeout)
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
      const statusData = await statusResponse.json();
      
      console.log(`Attempt ${attempts + 1}: Status = ${statusData.data.status}`);
      
      if (statusData.data.status === 'SUCCEEDED') {
        console.log('Scraping completed successfully!');
        
        // Get the dataset items
        const datasetResponse = await fetch(`${APIFY_BASE_URL}/datasets/${statusData.data.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`);
        const results = await datasetResponse.json();
        
        console.log('Apify scraping results:', results);
        
        return {
          success: true,
          results,
          message: 'Profile scraped successfully',
          runId
        };
        
      } else if (statusData.data.status === 'FAILED') {
        console.error('Scraping failed:', statusData.data);
        return { success: false, error: 'Apify scraping failed', details: statusData.data };
      }
      
      attempts++;
    }
    
    return { success: false, error: 'Apify scraping timeout after 60 seconds' };
    
  } catch (error) {
    console.error('LinkedIn profile scraping test error:', error);
    return { success: false, error: error.message };
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Apify Test Endpoint',
    example: {
      service: 'profile-test',
      linkedinUrl: 'https://www.linkedin.com/in/satya-nadella'
    }
  });
}