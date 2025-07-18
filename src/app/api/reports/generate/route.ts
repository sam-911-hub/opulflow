import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get request data
    const { type, dateRange, filters } = await request.json();
    
    if (!type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }
    
    // Parse date range
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
    
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();
    
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Generate report based on type
    const db = getAdminFirestore();
    let reportData = {};
    
    switch (type) {
      case 'credits': {
        // Get credit transactions
        const transactionsSnapshot = await db.collection('creditTransactions')
          .where('userId', '==', uid)
          .where('timestamp', '>=', startDateStr)
          .where('timestamp', '<=', endDateStr)
          .orderBy('timestamp', 'asc')
          .get();
        
        const transactions = transactionsSnapshot.docs.map(doc => doc.data());
        
        // Calculate usage by service
        const usageByService = {};
        const purchasesByMethod = {};
        
        transactions.forEach(tx => {
          if (tx.type === 'usage') {
            usageByService[tx.service] = (usageByService[tx.service] || 0) + tx.credits;
          } else if (tx.type === 'purchase') {
            purchasesByMethod[tx.paymentMethod] = (purchasesByMethod[tx.paymentMethod] || 0) + tx.credits;
          }
        });
        
        // Group by day
        const dailyUsage = {};
        transactions.forEach(tx => {
          const day = tx.timestamp.split('T')[0];
          dailyUsage[day] = dailyUsage[day] || { usage: 0, purchase: 0 };
          
          if (tx.type === 'usage') {
            dailyUsage[day].usage += tx.credits;
          } else if (tx.type === 'purchase') {
            dailyUsage[day].purchase += tx.credits;
          }
        });
        
        reportData = {
          usageByService,
          purchasesByMethod,
          dailyUsage,
          totalUsage: transactions.filter(tx => tx.type === 'usage').reduce((sum, tx) => sum + tx.credits, 0),
          totalPurchase: transactions.filter(tx => tx.type === 'purchase').reduce((sum, tx) => sum + tx.credits, 0),
        };
        break;
      }
      
      case 'contacts': {
        // Get contacts
        const contactsSnapshot = await db.collection('contacts')
          .where('userId', '==', uid)
          .where('createdAt', '>=', startDateStr)
          .where('createdAt', '<=', endDateStr)
          .get();
        
        const contacts = contactsSnapshot.docs.map(doc => doc.data());
        
        // Group by company
        const byCompany = {};
        contacts.forEach(contact => {
          const company = contact.company || 'Unknown';
          byCompany[company] = (byCompany[company] || 0) + 1;
        });
        
        // Group by day
        const dailyCreation = {};
        contacts.forEach(contact => {
          const day = contact.createdAt.split('T')[0];
          dailyCreation[day] = (dailyCreation[day] || 0) + 1;
        });
        
        reportData = {
          byCompany,
          dailyCreation,
          total: contacts.length,
        };
        break;
      }
      
      case 'sequences': {
        // Get sequence executions
        const executionsSnapshot = await db.collection('sequenceExecutions')
          .where('userId', '==', uid)
          .where('createdAt', '>=', startDateStr)
          .where('createdAt', '<=', endDateStr)
          .get();
        
        const executions = executionsSnapshot.docs.map(doc => doc.data());
        
        // Group by sequence
        const bySequence = {};
        executions.forEach(exec => {
          bySequence[exec.sequenceId] = bySequence[exec.sequenceId] || { total: 0, completed: 0, active: 0 };
          bySequence[exec.sequenceId].total += 1;
          
          if (exec.status === 'completed') {
            bySequence[exec.sequenceId].completed += 1;
          } else if (exec.status === 'active' || exec.status === 'scheduled') {
            bySequence[exec.sequenceId].active += 1;
          }
        });
        
        reportData = {
          bySequence,
          total: executions.length,
          completed: executions.filter(exec => exec.status === 'completed').length,
          active: executions.filter(exec => exec.status === 'active' || exec.status === 'scheduled').length,
        };
        break;
      }
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    // Store report in Firestore
    const reportRef = db.collection('reports').doc();
    await reportRef.set({
      userId: uid,
      type,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
      filters: filters || {},
      data: reportData,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      id: reportRef.id,
      type,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
      data: reportData,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}