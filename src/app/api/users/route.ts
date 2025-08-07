import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { isUserAdmin } from '@/lib/admin';

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
    const snapshot = await db.collection('users').limit(50).get();
    
    const users = [];
    snapshot.docs.forEach(doc => {
      const userData = doc.data();
      users.push({
        email: doc.id,
        name: userData.name || doc.id.split('@')[0] || 'Unknown',
        phone: userData.phone || 'N/A',
        credits: userData.credits || {
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
        services: userData.services || [],
        createdAt: userData.createdAt || new Date().toISOString()
      });
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ 
      users: [], 
      error: error.message 
    }, { status: 500 });
  }
}