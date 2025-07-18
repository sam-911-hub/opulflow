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
    const { email, domain, name, company } = await request.json();
    
    if (!email && !domain && !name && !company) {
      return NextResponse.json({ error: 'At least one search parameter is required' }, { status: 400 });
    }
    
    // Check if user has enough credits
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const leadCredits = userData.credits?.lead_lookup || 0;
    
    if (leadCredits < 1) {
      return NextResponse.json({ error: 'Insufficient lead lookup credits' }, { status: 403 });
    }
    
    // In a real implementation, you would call your lead data provider API here
    // For now, we'll return mock data
    
    // Deduct credits
    await updateDoc(userRef, {
      'credits.lead_lookup': leadCredits - 1
    });
    
    // Record transaction
    const transactionData = {
      type: 'consumption',
      amount: 1,
      service: 'lead_lookup',
      createdAt: new Date().toISOString(),
      remainingBalance: leadCredits - 1
    };
    
    await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
    
    // Return mock lead data
    return NextResponse.json({
      id: `lead_${Date.now()}`,
      name: name || 'John Doe',
      email: email || 'john@example.com',
      title: 'CEO',
      company: company || 'Example Inc',
      phone: '+1234567890',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: '@johndoe',
      verified: true,
      source: 'OpulFlow Database'
    });
    
  } catch (error) {
    console.error('Lead lookup error:', error);
    return NextResponse.json({ error: 'Failed to lookup lead' }, { status: 500 });
  }
}