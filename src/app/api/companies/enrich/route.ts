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
    
    // In a real implementation, you would call your company data provider API here
    // For now, we'll return mock data
    
    // Deduct credits
    await updateDoc(userRef, {
      'credits.company_enrichment': enrichmentCredits - 1
    });
    
    // Record transaction
    const transactionData = {
      type: 'consumption',
      amount: 1,
      service: 'company_enrichment',
      createdAt: new Date().toISOString(),
      remainingBalance: enrichmentCredits - 1
    };
    
    await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
    
    // Return mock company data
    return NextResponse.json({
      id: `company_${Date.now()}`,
      name: name || 'Example Inc',
      domain: domain || 'example.com',
      description: 'Example company description',
      industry: 'Technology',
      size: '51-200',
      founded: 2010,
      location: 'San Francisco, CA',
      funding: '$10M Series A',
      technologies: ['React', 'Node.js', 'AWS'],
      social: {
        linkedin: 'https://linkedin.com/company/example',
        twitter: '@example'
      }
    });
    
  } catch (error) {
    console.error('Company enrichment error:', error);
    return NextResponse.json({ error: 'Failed to enrich company data' }, { status: 500 });
  }
}