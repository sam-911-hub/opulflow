import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const BUILTWITH_API_KEY = '59ecad46-f475-4665-83af-387586b672e5';
const BUILTWITH_BASE_URL = 'https://api.builtwith.com/v21/api.json';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'tech-analysis');
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
      domain,
      includeHistorical = false,
      includeTechnographics = false,
      includeSpend = false
    } = await request.json();

    // Validate inputs
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ 
        error: 'Domain is required and must be a string' 
      }, { status: 400 });
    }

    const sanitizedDomain = sanitizeString(domain, 255);
    if (!sanitizedDomain) {
      return NextResponse.json({ 
        error: 'Domain is invalid or too long' 
      }, { status: 400 });
    }

    // Remove protocol if present
    const cleanDomain = sanitizedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const techAnalysisCredits = userData?.credits?.tech_analysis || 0;

    let creditsNeeded = 1; // 1 credit for basic lookup
    if (includeHistorical) creditsNeeded += 1;
    if (includeTechnographics) creditsNeeded += 2;
    if (includeSpend) creditsNeeded += 2;

    if (techAnalysisCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. Technology analysis requires ${creditsNeeded} credits ($${(creditsNeeded * 0.25).toFixed(2)})` 
      }, { status: 402 });
    }

    console.log('Analyzing website technologies with BuiltWith:', {
      domain: cleanDomain,
      includeHistorical,
      includeTechnographics,
      includeSpend
    });

    // Build BuiltWith API URL
    const builtwithUrl = new URL(BUILTWITH_BASE_URL);
    builtwithUrl.searchParams.set('KEY', BUILTWITH_API_KEY);
    builtwithUrl.searchParams.set('LOOKUP', cleanDomain);
    
    if (includeHistorical) builtwithUrl.searchParams.set('HISTORY', '1');
    if (includeTechnographics) builtwithUrl.searchParams.set('TECHNOGRAPHICS', '1');
    if (includeSpend) builtwithUrl.searchParams.set('SPEND', '1');

    // Make request to BuiltWith API
    const builtwithResponse = await fetch(builtwithUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OpulFlow/1.0'
      }
    });

    if (!builtwithResponse.ok) {
      const errorData = await builtwithResponse.text();
      console.error('BuiltWith API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'tech_analysis', creditsNeeded * 0.25, false, {
        error: errorData,
        domain: cleanDomain
      });

      return NextResponse.json({ 
        error: 'Failed to analyze website technologies',
        details: errorData,
        service: 'Technology Analysis'
      }, { status: 500 });
    }

    const builtwithData = await builtwithResponse.json();
    console.log('BuiltWith analysis completed successfully');

    // Process and structure the response
    const result = {
      domain: cleanDomain,
      technologies: [],
      categories: {},
      historicalData: includeHistorical ? builtwithData.Historical || [] : [],
      technographics: includeTechnographics ? builtwithData.Technographics || {} : {},
      spendData: includeSpend ? builtwithData.Spend || {} : {},
      analysisDate: new Date().toISOString(),
      provider: 'BuiltWith'
    };

    // Process current technologies
    if (builtwithData.Results && builtwithData.Results[0] && builtwithData.Results[0].Result) {
      const technologies = builtwithData.Results[0].Result.Paths || [];
      
      result.technologies = technologies.map((tech: any) => ({
        name: tech.Name || '',
        category: tech.Categories?.[0]?.Name || 'Unknown',
        firstDetected: tech.FirstIndexed || null,
        lastDetected: tech.LastIndexed || null,
        isPremium: tech.IsPremium || false,
        tag: tech.Tag || null,
        description: tech.Description || null,
        link: tech.Link || null
      }));

      // Group by categories
      technologies.forEach((tech: any) => {
        const category = tech.Categories?.[0]?.Name || 'Unknown';
        if (!result.categories[category]) {
          result.categories[category] = [];
        }
        result.categories[category].push({
          name: tech.Name,
          firstDetected: tech.FirstIndexed,
          lastDetected: tech.LastIndexed,
          isPremium: tech.IsPremium
        });
      });
    }

    // Add meta information
    result.meta = {
      totalTechnologies: result.technologies.length,
      categoriesCount: Object.keys(result.categories).length,
      premiumTechnologies: result.technologies.filter(t => t.isPremium).length,
      creditsUsed: creditsNeeded,
      analysisType: 'current' + (includeHistorical ? '+historical' : '') + 
                   (includeTechnographics ? '+demographics' : '') + 
                   (includeSpend ? '+spend' : '')
    };

    // Deduct credits
    await userRef.update({
      'credits.tech_analysis': techAnalysisCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'tech_analysis',
      subService: 'technology_lookup',
      amount: creditsNeeded,
      cost: creditsNeeded * 0.25,
      provider: 'BuiltWith',
      domain: cleanDomain,
      technologiesFound: result.technologies.length,
      includeHistorical,
      includeTechnographics,
      includeSpend,
      createdAt: new Date().toISOString(),
      remainingBalance: techAnalysisCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'tech_analysis', creditsNeeded * 0.25, true, {
      domain: cleanDomain,
      technologiesFound: result.technologies.length,
      categoriesFound: Object.keys(result.categories).length
    });

    return NextResponse.json({
      success: true,
      result,
      creditsUsed: creditsNeeded,
      remainingCredits: techAnalysisCredits - creditsNeeded,
      cost: creditsNeeded * 0.25,
      provider: 'BuiltWith'
    });

  } catch (error: any) {
    console.error('BuiltWith technology analysis error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Website Technology Analysis',
    cost: '$0.25 per basic lookup (+$0.25 for historical, +$0.50 for demographics, +$0.50 for spend data)',
    description: 'Discover what technologies, frameworks, and tools any website uses',
    provider: 'BuiltWith',
    features: [
      'Current technology stack detection',
      'Historical technology usage',
      'Technographic data',
      'Technology spend estimates',
      'Categorized technology breakdown',
      'Premium technology insights'
    ],
    parameters: {
      required: ['domain'],
      optional: ['includeHistorical', 'includeTechnographics', 'includeSpend']
    },
    categories: [
      'Web Servers',
      'Analytics',
      'JavaScript Libraries',
      'Content Management Systems',
      'E-commerce',
      'Advertising',
      'Payment Processors',
      'CDN',
      'Security',
      'Development Tools'
    ],
    example: {
      domain: 'example.com',
      includeHistorical: false,
      includeTechnographics: false,
      includeSpend: false
    }
  });
}