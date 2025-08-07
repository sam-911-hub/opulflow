import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get webhook data
    const webhookData = await request.json();
    
    // Get webhook signature from headers
    const signature = request.headers.get('x-webhook-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }
    
    // Get webhook type
    const { type, provider, userId, data } = webhookData;
    
    if (!type || !provider || !userId || !data) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }
    
    // Verify webhook signature (in a real implementation, you would verify the signature)
    // This is a simplified example
    
    // Find the CRM integration for this user and provider
    const integrationsRef = collection(db, `users/${userId}/crmIntegrations`);
    const q = query(integrationsRef, where("provider", "==", provider));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'CRM integration not found' }, { status: 404 });
    }
    
    const integration = querySnapshot.docs[0];
    const integrationId = integration.id;
    
    // Process webhook based on type
    switch (type) {
      case 'lead.created':
        // Add lead to OpulFlow
        await addDoc(collection(db, `users/${userId}/leads`), {
          name: data.name,
          email: data.email,
          company: data.company,
          title: data.title,
          phone: data.phone,
          status: 'new',
          source: `${provider} webhook`,
          createdAt: new Date().toISOString()
        });
        break;
        
      case 'lead.updated':
        // Update lead in OpulFlow
        // Find lead by email
        const leadsRef = collection(db, `users/${userId}/leads`);
        const leadQuery = query(leadsRef, where("email", "==", data.email));
        const leadSnapshot = await getDocs(leadQuery);
        
        if (!leadSnapshot.empty) {
          const lead = leadSnapshot.docs[0];
          await updateDoc(doc(db, `users/${userId}/leads`, lead.id), {
            name: data.name,
            company: data.company,
            title: data.title,
            phone: data.phone,
            status: data.status,
            updatedAt: new Date().toISOString()
          });
        }
        break;
        
      case 'deal.created':
      case 'deal.updated':
        // Process deal data
        // This would depend on your specific implementation
        break;
        
      default:
        return NextResponse.json({ error: 'Unsupported webhook type' }, { status: 400 });
    }
    
    // Update last synced timestamp
    await updateDoc(doc(db, `users/${userId}/crmIntegrations`, integrationId), {
      lastSynced: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}