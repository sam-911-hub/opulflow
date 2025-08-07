import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';
import { getStorage } from 'firebase-admin/storage';

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
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file metadata
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    // Get file buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    
    const filePath = `users/${uid}/files/${Date.now()}_${fileName}`;
    const fileRef = bucket.file(filePath);
    
    await fileRef.save(Buffer.from(buffer), {
      metadata: {
        contentType: fileType,
      },
    });
    
    // Generate download URL (valid for 7 days)
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Store file metadata in Firestore
    const db = getAdminFirestore();
    const fileDoc = db.collection('files').doc();
    
    await fileDoc.set({
      userId: uid,
      name: fileName,
      type: fileType,
      size: fileSize,
      path: filePath,
      url,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      id: fileDoc.id,
      name: fileName,
      type: fileType,
      size: fileSize,
      url,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}