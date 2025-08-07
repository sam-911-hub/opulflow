import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    const db = getAdminFirestore();
    await db.collection('_test').doc('health').set({
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}