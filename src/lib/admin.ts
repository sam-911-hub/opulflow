import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
function initAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Get Firebase Admin Auth
export function getAdminAuth() {
  const app = initAdmin();
  return getAuth(app);
}

// Get Firebase Admin Firestore
export function getAdminFirestore() {
  const app = initAdmin();
  return getFirestore(app);
}

// Check if user is admin
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const user = await getAdminAuth().getUser(uid);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    return adminEmails.includes(user.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Create session cookie
export async function createSessionCookie(idToken: string, expiresIn: number) {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn });
}

// Verify session cookie
export async function verifySessionCookie(sessionCookie: string) {
  return getAdminAuth().verifySessionCookie(sessionCookie);
}