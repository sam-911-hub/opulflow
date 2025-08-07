import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminDb: any;

try {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      console.error('FIREBASE_ADMIN_PRIVATE_KEY is not set');
      throw new Error('Firebase admin not configured');
    }
    
    let formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
  }
  adminDb = getFirestore();
} catch (error) {
  console.error('Firebase admin initialization failed:', error);
  adminDb = null;
}

export { adminDb };