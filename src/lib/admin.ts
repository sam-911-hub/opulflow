import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.NETLIFY;

// Initialize Firebase Admin
function initAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  try {
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || 
        !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
        !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      
      if (isBuildTime) {
        console.warn('Missing Firebase Admin credentials during build, using placeholder');
        // Return a placeholder to prevent build failures
        return null;
      }
      
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }
    
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    if (isBuildTime) {
      console.warn('Firebase Admin initialization failed during build, using placeholder');
      return null;
    }
    throw error;
  }
}

// Get Firebase Admin Auth
export function getAdminAuth() {
  try {
    const app = initAdmin();
    if (!app) {
      throw new Error('Firebase Admin not initialized');
    }
    return getAuth(app);
  } catch (error) {
    console.error('Error getting admin auth:', error);
    throw error;
  }
}

// Get Firebase Admin Firestore
export function getAdminFirestore() {
  try {
    const app = initAdmin();
    if (!app) {
      throw new Error('Firebase Admin not initialized');
    }
    return getFirestore(app);
  } catch (error) {
    console.error('Error getting admin firestore:', error);
    throw error;
  }
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