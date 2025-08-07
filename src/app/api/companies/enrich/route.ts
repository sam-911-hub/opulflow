import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;
    
    // Get request data
    const { domain, name } = await request.json();
    
    if (!domain && !name) {
      return NextResponse.json({ error: 'Domain or company name is required' }, { status: 400 });
    }
    
    // Check if user has enough credits
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const enrichmentCredits = userData.credits?.company_enrichment || 0;
    
    if (enrichmentCredits < 1) {
      return NextResponse.json({ error: 'Insufficient company enrichment credits' }, { status: 403 });
    }
    
    // TODO: Integrate with company data provider (Clearbit, FullContact, etc.)
    // For now, return error indicating service needs configuration
    return NextResponse.json({ 
      error: 'Company enrichment service not configured. Please contact support.' 
    }, { status: 503 });
    
  } catch (error) {
    console.error('Company enrichment error:', error);
    return NextResponse.json({ error: 'Failed to enrich company data' }, { status: 500 });
  }
}