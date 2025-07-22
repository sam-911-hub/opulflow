import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required' 
      }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userRef = doc(db, 'users', userId);

    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    const defaultCredits = {
      lead_lookup: credits?.lead_lookup || 100,
      company_enrichment: credits?.company_enrichment || 50,
      email_verification: credits?.email_verification || 200
    };

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        credits: defaultCredits,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Credits updated for user:', userId);
    } else {
      // Create new user document
      await setDoc(userRef, {
        credits: defaultCredits,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('User document created with credits:', userId);
    }

    return NextResponse.json({
      success: true,
      userId,
      credits: defaultCredits,
      message: 'Credits added successfully'
    });

  } catch (error: any) {
    console.error('Add credits error:', error);
    return NextResponse.json({
      error: 'Failed to add credits',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Add Credits Debug Endpoint',
    usage: 'POST { "userId": "your-user-id", "credits": { "lead_lookup": 100, "company_enrichment": 50, "email_verification": 200 } }',
    note: 'This endpoint is for testing purposes only'
  });
}