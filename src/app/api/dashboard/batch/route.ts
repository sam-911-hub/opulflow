import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Simplified: just fetch user data for now
    const userDoc = await getDoc(doc(db, 'users', email));
    const userData = userDoc.exists() ? userDoc.data() : {};

    return NextResponse.json({
      user: {
        email,
        name: userData.name || '',
        phone: userData.phone || '',
        credits: userData.credits || {
          lead_lookup: 0,
          ai_email: 0,
          company_enrichment: 0,
          email_verification: 0
        },
      },
      leads: [],
      pipelines: [],
      sequences: [],
      stats: {
        totalLeads: 0,
        totalPipelines: 0,
        totalSequences: 0,
      }
    });
  } catch (error) {
    console.error('Batch API error:', error);
    return NextResponse.json({
      user: {
        email: request.nextUrl.searchParams.get('email') || '',
        name: '',
        phone: '',
        credits: {
          lead_lookup: 0,
          ai_email: 0,
          company_enrichment: 0,
          email_verification: 0
        },
      },
      leads: [],
      pipelines: [],
      sequences: [],
      stats: {
        totalLeads: 0,
        totalPipelines: 0,
        totalSequences: 0,
      }
    });
  }
}