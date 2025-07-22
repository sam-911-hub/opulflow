import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';

const BREVO_API_KEY = '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';
const BREVO_BASE_URL = 'https://api.brevo.com/v3';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    const url = new URL(request.url);
    const messageId = url.searchParams.get('messageId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = url.searchParams.get('limit') || '50';

    let endpoint = '/emailCampaigns';
    let params: any = {};

    if (messageId) {
      // Get specific email events
      endpoint = '/emailCampaigns/events';
      params.messageId = messageId;
    } else {
      // Get email statistics for date range
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.limit = limit;
    }

    console.log('Fetching email analytics from Brevo:', { endpoint, params });

    // Get email analytics from Brevo
    const brevoResponse = await fetch(`${BREVO_BASE_URL}${endpoint}?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: {
        'api-key': BREVO_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error('Brevo analytics API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch email analytics',
        details: errorData
      }, { status: 500 });
    }

    const brevoData = await brevoResponse.json();

    // Also get user's email statistics from our database
    const db = getAdminFirestore();
    const transactionsQuery = await db
      .collection(`users/${userId}/transactions`)
      .where('service', '==', 'email_delivery')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const userEmailStats = {
      totalEmailsSent: 0,
      totalCost: 0,
      recentEmails: []
    };

    transactionsQuery.docs.forEach(doc => {
      const data = doc.data();
      userEmailStats.totalEmailsSent += data.emailsSent || 1;
      userEmailStats.totalCost += data.cost || 0;
      userEmailStats.recentEmails.push({
        messageId: data.messageId,
        subject: data.subject,
        recipients: data.recipients,
        cost: data.cost,
        sentAt: data.createdAt
      });
    });

    return NextResponse.json({
      success: true,
      analytics: brevoData,
      userStats: userEmailStats,
      provider: 'Email Analytics',
      fetchedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Email analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Handle webhook data from Brevo
    const webhookData = await request.json();
    
    console.log('Received Brevo webhook:', webhookData);

    // Store webhook data for analytics
    const db = getAdminFirestore();
    await db.collection(`users/${userId}/email_events`).add({
      ...webhookData,
      receivedAt: new Date().toISOString(),
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error('Email webhook processing error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}