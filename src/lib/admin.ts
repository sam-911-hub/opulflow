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
    // Check for required environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    console.log('Firebase Admin initialization check:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
      environment: process.env.NODE_ENV,
      isNetlify: !!process.env.NETLIFY,
      isBuildTime
    });

    if (!projectId || !clientEmail || !privateKey) {
      const missingVars = [];
      if (!projectId) missingVars.push('FIREBASE_ADMIN_PROJECT_ID');
      if (!clientEmail) missingVars.push('FIREBASE_ADMIN_CLIENT_EMAIL');
      if (!privateKey) missingVars.push('FIREBASE_ADMIN_PRIVATE_KEY');
      
      if (isBuildTime) {
        console.warn('Missing Firebase Admin credentials during build, using placeholder');
        return null;
      }
      
      throw new Error(`Missing Firebase Admin credentials: ${missingVars.join(', ')}`);
    }
    
    // Clean and format the private key
    const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    console.log('Initializing Firebase Admin with credentials...');
    
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: cleanPrivateKey,
      }),
    });

    console.log('Firebase Admin initialized successfully');
    return app;
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
      throw new Error('Firebase Admin not initialized - missing environment variables');
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
      throw new Error('Firebase Admin not initialized - missing environment variables');
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
    const adminEmails = (process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || '').split(',');
    return adminEmails.includes(user.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Create session cookie
export async function createSessionCookie(idToken: string, expiresIn: number) {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn });
}

// Verify session cookie
export async function verifySessionCookie(sessionCookie: string) {
  const auth = getAdminAuth();
  return auth.verifySessionCookie(sessionCookie);
}