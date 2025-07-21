import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.NETLIFY;

// Initialize Firebase Admin
function initAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    console.log('Firebase Admin already initialized, reusing existing app');
    return apps[0];
  }

  try {
    // Check for required environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    console.log('Firebase Admin initialization check:', {
      hasProjectId: !!projectId,
      projectIdValue: projectId, // Show actual value for debugging
      hasClientEmail: !!clientEmail,
      clientEmailValue: clientEmail, // Show actual value for debugging
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyStart: privateKey ? privateKey.substring(0, 50) + '...' : 'N/A',
      environment: process.env.NODE_ENV,
      isNetlify: !!process.env.NETLIFY,
      isVercel: !!process.env.VERCEL,
      isBuildTime,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('FIREBASE')).sort()
    });

    if (!projectId || !clientEmail || !privateKey) {
      const missingVars = [];
      if (!projectId) missingVars.push('FIREBASE_ADMIN_PROJECT_ID');
      if (!clientEmail) missingVars.push('FIREBASE_ADMIN_CLIENT_EMAIL');
      if (!privateKey) missingVars.push('FIREBASE_ADMIN_PRIVATE_KEY');
      
      console.error('Missing Firebase Admin environment variables:', missingVars);
      
      if (isBuildTime) {
        console.warn('Missing Firebase Admin credentials during build, using placeholder');
        return null;
      }
      
      throw new Error(`Missing Firebase Admin credentials: ${missingVars.join(', ')}. Please check your Netlify environment variables.`);
    }
    
    // Clean and format the private key
    let cleanPrivateKey = privateKey;
    
    // Handle different private key formats
    if (privateKey.includes('\\n')) {
      cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
      console.log('Converted \\n to actual newlines in private key');
    }
    
    // Validate private key format
    if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Private key format is invalid - missing BEGIN header');
    }
    
    if (!cleanPrivateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Private key format is invalid - missing END footer');
    }
    
    console.log('Initializing Firebase Admin with credentials...');
    console.log('Private key format check:', {
      hasBeginHeader: cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----'),
      hasEndFooter: cleanPrivateKey.includes('-----END PRIVATE KEY-----'),
      actualLength: cleanPrivateKey.length,
      lineCount: cleanPrivateKey.split('\n').length
    });
    
    const credential = cert({
      projectId,
      clientEmail,
      privateKey: cleanPrivateKey,
    });

    const app = initializeApp({
      credential: credential,
    });

    console.log('Firebase Admin initialized successfully');
    return app;
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    
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
      throw new Error('Firebase Admin not initialized - missing environment variables or build-time execution');
    }
    const auth = getAuth(app);
    console.log('Firebase Admin Auth obtained successfully');
    return auth;
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
      throw new Error('Firebase Admin not initialized - missing environment variables or build-time execution');
    }
    const firestore = getFirestore(app);
    console.log('Firebase Admin Firestore obtained successfully');
    return firestore;
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
  console.log('Creating session cookie with expiration:', expiresIn);
  const auth = getAdminAuth();
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  console.log('Session cookie created successfully');
  return sessionCookie;
}

// Verify session cookie
export async function verifySessionCookie(sessionCookie: string) {
  console.log('Verifying session cookie...');
  const auth = getAdminAuth();
  const decodedClaims = await auth.verifySessionCookie(sessionCookie);
  console.log('Session cookie verified successfully for user:', decodedClaims.uid);
  return decodedClaims;
}