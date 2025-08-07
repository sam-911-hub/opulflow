import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set');
  }
  
  let formattedPrivateKey = privateKey;
  if (privateKey.includes('\\n')) {
    formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedPrivateKey}\n-----END PRIVATE KEY-----\n`;
  }
  
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: formattedPrivateKey,
    }),
  });
}

export function getAdminAuth() {
  return getAuth();
}

export function getAdminFirestore() {
  return getFirestore();
}

export async function verifySessionCookie(sessionCookie: string) {
  return await getAdminAuth().verifySessionCookie(sessionCookie);
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userRecord = await getAdminAuth().getUser(uid);
    return adminEmails.includes(userRecord.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}