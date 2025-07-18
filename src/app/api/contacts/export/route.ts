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
    
    // Get format from query params
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    
    // Query all user's contacts from Firestore
    const db = getAdminFirestore();
    const snapshot = await db.collection('contacts')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Format results
    const contacts = snapshot.docs.map(doc => {
      const data = doc.data();
      // Remove internal fields
      const { userId, ...contactData } = data;
      return {
        id: doc.id,
        ...contactData,
      };
    });
    
    // Return based on requested format
    if (format === 'csv') {
      // Generate CSV
      if (contacts.length === 0) {
        return NextResponse.json(
          { error: 'No contacts to export' },
          { status: 404 }
        );
      }
      
      // Get headers from first contact
      const headers = Object.keys(contacts[0]).filter(key => key !== 'id');
      
      // Create CSV content
      let csv = headers.join(',') + '\\n';
      
      contacts.forEach(contact => {
        const row = headers.map(header => {
          const value = contact[header];
          // Handle values with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        });
        csv += row.join(',') + '\\n';
      });
      
      // Return CSV response
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=contacts.csv',
        },
      });
    }
    
    // Default: return JSON
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Export contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}