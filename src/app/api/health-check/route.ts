import { NextResponse } from 'next/server';

const HUNTER_API_KEY = 'fe9c130cb16875866817161423a1fde5781c89f1';
const APIFY_API_TOKEN = 'apify_api_WSXLJzUgmq1BKGDQX0fWeqAx0Hp9R114klEk';

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {},
    environment: {
      nodeEnv: process.env.NODE_ENV,
      deployment: process.env.NETLIFY ? 'netlify' : process.env.VERCEL ? 'vercel' : 'unknown'
    }
  };

  // Test Hunter.io API
  try {
    const hunterResponse = await fetch(`https://api.hunter.io/v2/account?api_key=${HUNTER_API_KEY}`);
    if (hunterResponse.ok) {
      const hunterData = await hunterResponse.json();
      healthCheck.services.hunter = {
        status: 'healthy',
        requests: hunterData.data?.requests || 'unknown',
        plan: hunterData.data?.plan_name || 'unknown',
        responseTime: '< 1s'
      };
    } else {
      throw new Error(`HTTP ${hunterResponse.status}`);
    }
  } catch (error) {
    healthCheck.services.hunter = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
    healthCheck.status = 'degraded';
  }

  // Test Apify API
  try {
    const apifyResponse = await fetch(`https://api.apify.com/v2/users/me?token=${APIFY_API_TOKEN}`);
    if (apifyResponse.ok) {
      const apifyData = await apifyResponse.json();
      healthCheck.services.apify = {
        status: 'healthy',
        username: apifyData.data?.username || 'unknown',
        plan: apifyData.data?.plan || 'unknown',
        responseTime: '< 1s'
      };
    } else {
      throw new Error(`HTTP ${apifyResponse.status}`);
    }
  } catch (error) {
    healthCheck.services.apify = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
    healthCheck.status = 'degraded';
  }

  // Test Firebase Admin (basic check)
  try {
    const { getAdminFirestore } = await import('@/lib/admin');
    const db = getAdminFirestore();
    // Simple read operation to test connection
    await db.collection('health-check').doc('test').get();
    healthCheck.services.firebase = {
      status: 'healthy',
      responseTime: '< 1s'
    };
  } catch (error) {
    healthCheck.services.firebase = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
    healthCheck.status = 'degraded';
  }

  // Overall health assessment
  const serviceCount = Object.keys(healthCheck.services).length;
  const healthyCount = Object.values(healthCheck.services).filter(s => s.status === 'healthy').length;
  
  if (healthyCount === 0) {
    healthCheck.status = 'unhealthy';
  } else if (healthyCount < serviceCount) {
    healthCheck.status = 'degraded';
  }

  healthCheck['healthScore'] = `${healthyCount}/${serviceCount}`;

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 207 : 503;

  return NextResponse.json(healthCheck, { status: statusCode });
}