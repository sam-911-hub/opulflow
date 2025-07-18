import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get time period from query params
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d'; // Default to last 30 days
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    const startDateStr = startDate.toISOString();
    
    // Get Firestore instance
    const db = getAdminFirestore();
    
    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Get credit transactions for the period
    const transactionsSnapshot = await db.collection('creditTransactions')
      .where('userId', '==', uid)
      .where('timestamp', '>=', startDateStr)
      .orderBy('timestamp', 'desc')
      .get();
    
    const transactions = transactionsSnapshot.docs.map(doc => doc.data());
    
    // Calculate credit usage
    const creditUsage = transactions
      .filter(t => t.type === 'usage')
      .reduce((total, t) => total + (t.credits || 0), 0);
    
    // Calculate credit purchases
    const creditPurchases = transactions
      .filter(t => t.type === 'purchase')
      .reduce((total, t) => total + (t.credits || 0), 0);
    
    // Get contacts count
    const contactsSnapshot = await db.collection('contacts')
      .where('userId', '==', uid)
      .count()
      .get();
    
    const contactsCount = contactsSnapshot.data().count;
    
    // Get recent activities
    const activitiesSnapshot = await db.collection('userActivities')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const recentActivities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Compile dashboard stats
    const stats = {
      currentCredits: userData?.credits || 0,
      creditUsage,
      creditPurchases,
      contactsCount,
      recentActivities,
      period,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
}