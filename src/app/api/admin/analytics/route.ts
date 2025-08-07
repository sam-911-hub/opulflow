import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, isUserAdmin } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const isAdmin = await isUserAdmin(authResult.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = getAdminFirestore();
    
    // Get user count
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;
    
    // Get total transactions
    const transactionsSnapshot = await db.collection('transactions').count().get();
    const totalTransactions = transactionsSnapshot.data().count;
    
    // Get recent transactions for revenue calculation
    const recentTransactions = await db.collection('transactions')
      .where('type', '==', 'purchase')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const totalRevenue = recentTransactions.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalRevenue,
      activeUsers: Math.floor(totalUsers * 0.7), // Estimate
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}