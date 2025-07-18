import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get query parameters
    const url = new URL(request.url);
    const reportId = url.searchParams.get('id');
    const format = url.searchParams.get('format') || 'json';
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }
    
    // Get report from Firestore
    const db = getAdminFirestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();
    
    if (!reportDoc.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    // Check if user owns the report
    const reportData = reportDoc.data();
    if (reportData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Export based on format
    if (format === 'csv') {
      // Convert report data to CSV
      let csv = '';
      const data = reportData.data;
      
      switch (reportData.type) {
        case 'credits': {
          // Usage by service
          csv += 'Service,Credits Used\\n';
          Object.entries(data.usageByService || {}).forEach(([service, credits]) => {
            csv += `${service},${credits}\\n`;
          });
          
          csv += '\\nPayment Method,Credits Purchased\\n';
          Object.entries(data.purchasesByMethod || {}).forEach(([method, credits]) => {
            csv += `${method},${credits}\\n`;
          });
          
          csv += '\\nDate,Usage,Purchase\\n';
          Object.entries(data.dailyUsage || {}).forEach(([date, values]) => {
            csv += `${date},${values.usage},${values.purchase}\\n`;
          });
          break;
        }
        
        case 'contacts': {
          // Contacts by company
          csv += 'Company,Count\\n';
          Object.entries(data.byCompany || {}).forEach(([company, count]) => {
            csv += `${company},${count}\\n`;
          });
          
          csv += '\\nDate,Contacts Created\\n';
          Object.entries(data.dailyCreation || {}).forEach(([date, count]) => {
            csv += `${date},${count}\\n`;
          });
          break;
        }
        
        case 'sequences': {
          // Sequences
          csv += 'Sequence ID,Total,Completed,Active\\n';
          Object.entries(data.bySequence || {}).forEach(([sequenceId, stats]) => {
            csv += `${sequenceId},${stats.total},${stats.completed},${stats.active}\\n`;
          });
          break;
        }
      }
      
      // Return CSV response
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${reportData.type}_report_${reportId}.csv`,
        },
      });
    }
    
    // Default: return JSON
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}