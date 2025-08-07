import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      // Return default stats for unauthenticated users
      return NextResponse.json({
        currentCredits: {
          leads: 0,
          companies: 0,
          emails: 0,
          ai: 0,
          techstack: 0,
          intent: 0,
          calls: 0,
          crm: 0,
          workflows: 0
        },
        creditUsage: 0,
        creditPurchases: 0,
        contactsCount: 0,
        recentActivities: [],
        period: '30d',
        authenticated: false
      });
    }
    
    const uid = authResult.uid;
    
    // Get time period from query params
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d';
    
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
    
    // Get user data (try by email first, then by uid)
    let userData = null;
    try {
      if (authResult.email) {
        const userByEmail = await db.collection('users').doc(authResult.email).get();
        if (userByEmail.exists) {
          userData = userByEmail.data();
        }
      }
      
      if (!userData) {
        const userByUid = await db.collection('users').doc(uid).get();
        userData = userByUid.exists ? userByUid.data() : null;
      }
    } catch (userError) {
      console.warn('Failed to fetch user data:', userError);
    }
    
    if (!userData) {
      // Create default user data if not found
      userData = {
        email: authResult.email,
        uid: uid,
        credits: {
          leads: 0,
          companies: 0,
          emails: 0,
          ai: 0,
          techstack: 0,
          intent: 0,
          calls: 0,
          crm: 0,
          workflows: 0
        },
        createdAt: new Date().toISOString()
      };
    }
    
    // Get transactions for the period (with error handling)
    let transactions = [];
    try {
      const transactionsSnapshot = await db.collection('transactions')
        .where('userId', '==', uid)
        .where('createdAt', '>=', startDateStr)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
      
      transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (transactionError) {
      console.warn('Failed to fetch transactions:', transactionError);
      // Continue without transactions data
    }
    
    // Calculate credit usage and purchases
    const creditUsage = transactions
      .filter(t => t.type === 'consumption')
      .reduce((total, t) => total + (t.amount || 0), 0);
    
    const creditPurchases = transactions
      .filter(t => t.type === 'purchase')
      .reduce((total, t) => total + (t.amount || 0), 0);
    
    // Get contacts count (with error handling)
    let contactsCount = 0;
    try {
      const contactsSnapshot = await db.collection('contacts')
        .where('userId', '==', uid)
        .count()
        .get();
      
      contactsCount = contactsSnapshot.data().count;
    } catch (contactsError) {
      console.warn('Failed to fetch contacts count:', contactsError);
      // Continue with default count
    }
    
    // Get recent activities (last 10 transactions)
    const recentActivities = transactions.slice(0, 10).map(t => ({
      id: t.id || 'unknown',
      type: t.service || t.type,
      description: t.description || `${t.type} - ${t.service}`,
      timestamp: t.createdAt
    }));
    
    // Compile dashboard stats
    const stats = {
      currentCredits: userData?.credits || {
        leads: 0,
        companies: 0,
        emails: 0,
        ai: 0,
        techstack: 0,
        intent: 0,
        calls: 0,
        crm: 0,
        workflows: 0
      },
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