import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';
import { getStorage } from 'firebase-admin/storage';

export async function DELETE(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get file ID from URL
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Get file from Firestore
    const db = getAdminFirestore();
    const fileRef = db.collection('files').doc(fileId);
    const fileDoc = await fileRef.get();
    
    if (!fileDoc.exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Check if user owns the file
    const fileData = fileDoc.data();
    if (fileData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete from Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    
    await bucket.file(fileData?.path).delete().catch(err => {
      console.warn('Storage delete error (continuing):', err);
      // Continue even if storage delete fails
    });
    
    // Delete from Firestore
    await fileRef.delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}