import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d';
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      default: startDate.setDate(now.getDate() - 30);
    }

    const db = getAdminFirestore();
    
    // Get usage data from transactions
    const transactionsSnapshot = await db.collection('transactions')
      .where('userId', '==', authResult.uid)
      .where('createdAt', '>=', startDate.toISOString())
      .where('type', '==', 'consumption')
      .get();

    const usageByService = {};
    const dailyUsage = {};

    transactionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const service = data.service || 'unknown';
      const date = data.createdAt?.split('T')[0];
      
      usageByService[service] = (usageByService[service] || 0) + (data.amount || 0);
      dailyUsage[date] = (dailyUsage[date] || 0) + (data.amount || 0);
    });

    return NextResponse.json({
      period,
      totalUsage: Object.values(usageByService).reduce((sum, val) => sum + val, 0),
      usageByService,
      dailyUsage,
    });
  } catch (error) {
    console.error('Usage analytics error:', error);
    return NextResponse.json({ error: 'Failed to get usage analytics' }, { status: 500 });
  }
}